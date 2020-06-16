import {observable, action, runInAction, computed} from 'mobx'
import {Transaction, xdr as xdrTypes, Server} from 'stellar-sdk'
import {inspectTransactionSigners} from '@stellar-expert/tx-signers-inspector'
import {hintMatchesKey, zeroAccount} from '../util/signature-hint-utils'
import {resolveNetworkParams} from '../util/network-resolver'
import standardErrors from '../util/errors'

class TxContext {
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
        this.signatures = []
        this.availableSigners = []
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

    get isReadyForSigning() {
        return this.tx && !this.hasEmptyTxSequence && !this.hasEmptyTxSource
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

    /**
     * Replace source account if transaction sourceAccount is empty.
     * @param {String} sourceAccountPublicKey
     */

    /*@action
    async setTxSourceAccount(sourceAccountPublicKey) {
        //TODO: check that sequence always updated if the source account is updated.
        if (!this.hasEmptyTxSource) throw new Error('Failed to change transaction source account. Source account has been set already.')
        this.tx.source = sourceAccountPublicKey //update ths source field in the transaction itself
        this.tx.tx._attributes.sourceAccount = Keypair.fromPublicKey(sourceAccountPublicKey).xdrAccountId() //update nested xdr
        await this.updateSignatureSchema()
    }*/

    /**
     * Replace transaction sequence if it wasn't provided in the original transaction.
     * @param {String} [newSequence]
     */
    @action
    async setTxSequence(newSequence = null) {
        if (!this.hasEmptyTxSequence) throw new Error('Failed to change transaction sequence. Sequence has been set already.')
        try {
            if (!newSequence) {
                const horizon = new Server(this.horizon),
                    sourceAccount = await horizon.loadAccount(this.sourceAccount)

                newSequence = sourceAccount.sequenceNumber()
            }
            //const sequenceNumber = new BigNumber(sourceAccount.sequenceNumber()).add(1).toString()
            this.tx.sequence = newSequence
            this.tx.tx._attributes.seqNum = xdrTypes.SequenceNumber.fromString(newSequence)
        } catch (err) {
            console.error(err)
            if (err.response) { //treat as Horizon error
                if (err.response.status === 404)
                    throw standardErrors.externalError(new Error('Source account doesn\'t exist on the network.'))
                throw standardErrors.externalError('Horizon error.')
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
     * @param key
     */
    removeSignatureByKey(key) {
        const sig = this.findSignatureByKey(key)
        if (sig) {
            this.signatures.splice(this.signatures.indexOf(sig), 1)
        }
    }

    /**
     * Remove a signature by hint.
     * @param hint
     */
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
        })
        return schema
    }

    /**
     * Sign the transaction using plain secret key.
     * @param {ActionExecutionContext} executionContext
     */
    @action
    async signDirect(executionContext) {
        //replace tx source account and sequence number if necessary
        /*if (this.hasEmptyTxSource) {
            await this.setTxSourceAccount(publicKey)
        }*/
        if (this.hasEmptyTxSequence) {
            await this.setTxSequence()
        }
        const newSignature = await executionContext.signTransaction(this.tx)
        //add full pubkey to the decorated signature for the fast lookup
        Object.assign(newSignature, {
            pubKey: executionContext.publicKey,
            new: true
        })
        //TODO: append to the signatures list if it's not there yet
        this.signatures = this.tx.signatures.slice()
    }
}

export default TxContext
