import {Account as SdkAccount} from 'stellar-sdk'
import accountManager from '../../src/state/account-manager'
import Account from '../../src/state/account'
import AccountKeypair from '../../src/state/account-keypair'
import Credentials from '../../src/state/credentials'
import {fakeHorizon} from './fake-horizon'

const publicKey = 'GCI5HWSNSUVF6NM572PTOSC6S4IMQJX3IHSCWRCEPPSILLTVQWNBGPC2'
const privateKey = 'SDD5EMWN7EGOTNPHRS5HDDUP6IMYJ5OFUGKHYE7X37Q6PWNYF5I2WWPT'

async function setupAccountManager() {
    const fakeAccount = new Account({id: publicKey})
    const fakeCredetials = await Credentials.create({
        account: fakeAccount,
        password: 'password'
    })
    fakeHorizon.addAccount(publicKey, new SdkAccount(publicKey, '1'))
    fakeCredetials.checkValidity = () => true
    const keypair = new AccountKeypair()
    keypair.friendlyName = 'Test keypair'
    keypair.publicKey = publicKey
    fakeAccount.keypairs.push(keypair)
    const sensitiveData = fakeAccount.requestAccountSecret(fakeCredetials)
    sensitiveData.addOrUpdateKeypair({secret: privateKey, friendlyName: 'Test keypair'})
    await fakeAccount.updateAccountSecret(fakeCredetials, sensitiveData)
    accountManager.addAccount(fakeAccount)
    accountManager.setSelectedKeypair(keypair)
    accountManager.setActiveAccount(fakeAccount)
}

export {setupAccountManager, publicKey, privateKey}
