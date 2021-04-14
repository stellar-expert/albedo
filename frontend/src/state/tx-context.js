import {observable, action, runInAction, computed} from 'mobx'
import {Transaction, xdr as xdrTypes, Server} from 'stellar-sdk'
import Bignumber from 'bignumber.js'
import {inspectTransactionSigners} from '@stellar-expert/tx-signers-inspector'
import {formatHint, hintMatchesKey} from '../util/signature-hint-utils'
import {substituteSourceAccount, substituteSourceSequence, zeroAccount} from '../util/tx-replace-utils'
import {resolveNetworkParams} from '../util/network-resolver'
import standardErrors from '../util/errors'
import accountManager from './account-manager'

export default class TxContext {
    /**
     *
     * @param {Transaction} transaction
     * @param {{[network]: String, [horizon]: String}} intentParams
     */
    constructor(transaction, intentParams) {
        this.tx = transaction
        //set up network passphrase and Horizon url
        Object.assign(this, resolveNetworkParams(intentParams))
        //TODO: retrieve pre-set signatures from tx
        this.signatures = [...transaction.signatures]
        this.availableSigners = []
        this.mapSignatureKeys()
    }

    /**
     * The transaction itself.
     * @type {Transaction}
     */
    tx

    /**
     * Predefined network ("public", "testnet") or the passphrase of a private network.
     * @type {String}
     */
    network

    /**
     * Horizon endpoint (only required for signature schema lookup).
     * @type {String}
     */
    horizon

    /**
     * Signers available for automatic signature.
     * @type {Array<String>}
     */
    @observable.shallow
    availableSigners

    /**
     * Applied signatures.
     * @type {Array<DecoratedSignature>}
     */
    @observable.shallow
    signatures

    /**
     * Auto-discovered signatures schema.
     * @type {SignatureSchema}
     */
    @observable
    signatureSchema

    get sourceAccount() {
        return this.tx.source
    }

    get hasEmptyTxSource() {
        return this.sourceAccount === zeroAccount
    }

    get hasEmptyTxSequence() {
        return this.tx.sequence == '0'
    }

    @action
    setAvailableSigners(availableSigners) {
        this.availableSigners = availableSigners || []
        //reset schema after potential signers update
        this.signatureSchema = null
    }

    @computed
    get isFullySigned() {
        //no signing schema
        if (!this.signatureSchema) return false
        //at least one signature is required
        if (!this.signatures.length) return false
        //check the required signatures
        return this.signatureSchema.checkFeasibility(this.signatures.map(s => s.pubKey))
    }

    get isReadyForSigning() {
        return this.tx && !this.hasEmptyTxSequence && !this.hasEmptyTxSource
    }

    @computed
    get isPartiallySigned() {
        return this.signatures.length > 0 && !this.isFullySigned
    }

    /**
     * Replace source account if transaction sourceAccount is empty.
     * @param {String} sourceAccountPublicKey
     */
    @action
    async setTxSourceAccount(sourceAccountPublicKey) {
        substituteSourceAccount(this.tx, sourceAccountPublicKey)
        await this.updateSignatureSchema()
        const newSequence = sourceAccountPublicKey === zeroAccount ? '0' : undefined
        await this.setTxSequence(newSequence)
    }

    /**
     * Replace transaction sequence if it wasn't provided in the original transaction.
     * @param {String} [newSequence]
     */
    @action
    async setTxSequence(newSequence) {
        try {
            if (newSequence === undefined) {
                const horizon = new Server(this.horizon),
                    sourceAccount = await horizon.loadAccount(this.sourceAccount)

                newSequence = new Bignumber(sourceAccount.sequenceNumber()).add(1).toString()
            }
            substituteSourceSequence(this.tx, newSequence)
        } catch (err) {
            console.error(err)
            if (err.response) { //treat as Horizon error
                if (err.response.status === 404)
                    throw standardErrors.externalError(new Error('Source account doesn\'t exist on the network.'))
                throw standardErrors.horizonError('Horizon error.')
            }
        }
    }

    /**
     * Locate the signature for the particular key by a hint.
     * @param {String} key - Signer key.
     * @return {DecoratedSignature|null}
     */
    findSignatureByKey(key) {
        for (let sig of this.signatures) {
            if (hintMatchesKey(sig.hint(), key)) return sig
        }
        return null
    }

    /**
     * Remove a signature by signer key.
     * @param {String} key - Signer key.
     */
    @action
    removeSignatureByKey(key) {
        const sig = this.findSignatureByKey(key)
        if (sig) {
            this.signatures.splice(this.signatures.indexOf(sig), 1)
            if (this.sourceAccount === key) {
                this.setTxSourceAccount(zeroAccount) //reset source account
            }
        }
    }

    /**
     * Remove a signature by hint.
     * @param hint
     */
    @action
    removeSignatureByHint(hint) {
        const hintAsHex = hint.toString('hex')
        for (let i = 0; i < this.signatures.length; i++) {
            let sig = this.signatures[i]
            if (sig.hint().toString('hex') === hintAsHex) {
                this.signatures.splice(i, 1)
                return
            }
        }
    }

    @action
    async updateSignatureSchema() {
        this.signatureSchema = null
        if (this.hasEmptyTxSource) return
        //TODO: pass preferred signers (belonging to current account)
        const schema = await inspectTransactionSigners(this.tx, {horizon: this.horizon})
        runInAction(() => {
            this.signatureSchema = schema
            this.mapSignatureKeys()
        })
        return schema
    }

    /**
     * Sign the transaction using plain secret key.
     * @param {ActionExecutionContext} executionContext
     * @return {Boolean}
     */
    @action
    async sign(executionContext) {
        //replace tx source account and sequence number if necessary
        if (this.hasEmptyTxSource) {
            await this.setTxSourceAccount(executionContext.publicKey)
        } else if (this.hasEmptyTxSequence) {
            await this.setTxSequence()
        }
        const newSignature = await executionContext.signTransaction(this.tx)
        if (!newSignature) return false
        //add full pubkey to the decorated signature for the fast lookup
        Object.assign(newSignature, {
            pubKey: executionContext.publicKey,
            new: true
        })
        //TODO: append to the signatures list if it's not there yet
        this.signatures = this.tx.signatures.slice()
        this.mapSignatureKeys()
        return true
    }

    /**
     * Map signatures to user-owned accounts or potential transaction signers.
     */
    mapSignatureKeys() {
        const allSigners = accountManager.accounts.map(a => a.publicKey)
        if (this.signatureSchema) {
            for (let s of this.signatureSchema.getAllPotentialSigners())
                if (!allSigners.includes(s)) {
                    allSigners.push(s)
                }
        }
        for (let s of this.signatures) {
            const hint = s.hint()
            const matchingKey = allSigners.find(s => hintMatchesKey(hint, s))
            if (matchingKey) {
                s.pubKey = matchingKey
            }
        }
    }
}
