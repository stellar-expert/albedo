import React from 'react'
import styles from './backup-restore.scss'
import {retrieveRecentAccount, persistAccountInBrowser} from '../../storage/account-storage'
import accountManager from '../../state/account-manager'
import AccountKeypair from '../../state/account-keypair'

class RestoreView extends React.Component {
    constructor(props) {
        super(props)
    }

    restore() {
        const activeAccountId = retrieveRecentAccount()
        const activeAccount = accountManager.get(activeAccountId)

        const input = document.createElement('input')
        input.type = 'file'

        input.addEventListener('change', (event) => {
            [...event.target.files].forEach((backupFile) => {
                const reader = new FileReader()
                reader.onload = async (event) => {
                    const backupContent = event.target.result
                    const credentials = await activeAccount.getCredentials(false) // TODO: request OTP
                    const decryptedKeypairs = Crypto.AES.decrypt(backupContent, credentials.account.id + credentials.password).toString(Crypto.enc.Utf8)
                    const keypairs = JSON.parse(decryptedKeypairs)
                    keypairs.forEach(keypair => {
                        activeAccount.addKeypair(new AccountKeypair(keypair, activeAccount))
                    })
                    persistAccountInBrowser(activeAccount)
                }
                reader.readAsText(backupFile)
            })
        })

        input.dispatchEvent(new MouseEvent('click'))
    }

    render() {
        return <div className={styles.mainContainer}>
            <button className="button" onClick={this.restore}>Restore keypairs from backup</button>
        </div>
    }
}

export default RestoreView
