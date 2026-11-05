import accountManager from '../../src/state/account-manager'
import Account from '../../src/state/account'
import Credentials from '../../src/state/auth/credentials'
import {generateRandomEncryptionKey} from '../../src/util/crypto/random'
import {fakeHorizon} from './fake-horizon'

const publicKey = 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2'
const privateKey = 'SDD5EMWN7EGOTNPHRS5HDDUP6IMYJ5OFUGKHYE7X37Q6PWNYF5I2WWPT'

/**
 * Create a stored account, make it active, and register it on the fake Horizon.
 * @return {Promise<Credentials>} - Credentials used to authorize intent requests
 */
async function setupAccountManager() {
    //provide the encryption key directly to skip the password hashing
    const credentials = await Credentials.create({password: 'password', encryptionKey: generateRandomEncryptionKey()})
    const account = await Account.createNew(credentials, privateKey, 'Test account')
    credentials.account = account
    accountManager.addAccount(account)
    await accountManager.setActiveAccount(account)
    fakeHorizon.addAccount(publicKey)
    return credentials
}

export {setupAccountManager, publicKey, privateKey}
