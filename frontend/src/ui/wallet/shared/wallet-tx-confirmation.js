import {Keypair} from 'stellar-sdk'
import authorization from '../../../state/auth/authorization'
import accountManager from '../../../state/account-manager'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {createHorizon} from '../../../util/horizon-connector'

export async function confirmTransaction(network, transaction) {
    //obtain user credentials
    const credentials = await authorization.requestAuthorization(accountManager.activeAccount)

    //TODO: extract signing logic from wallet actions and intent action logic into a shared module
    if (credentials.account.isStoredAccount) { //stored account
        transaction.sign(await Keypair.fromSecret(credentials.requestAccountSecret()))
    } else if (credentials.account.isHWAccount) { //hardware wallet
        try {
            await this.hwSigner.signTransaction({
                path: credentials.account.path,
                publicKey: credentials.account.publicKey,
                transaction
            })
        } catch (e) {
            switch (e.name) {
                case 'TransportStatusError':
                default:
                    alert('Failed to connect. Please check hardware wallet connection.')
                    break
            }
            return
        }
    }
    //add a pending transaction record to the account tx history
    const inProgressTx = accountLedgerData.history.addInProgressTx(transaction)
    let successful = false
    try {
        //submit to the network
        await createHorizon(network).submitTransaction(transaction)
        successful = true
    } catch (e) {
        console.error(e)
    }
    await accountLedgerData.loadAccountInfo()
    return successful
}