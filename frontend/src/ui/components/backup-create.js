import React from 'react'
import Lightbox from '../components/lightbox'
import styles from './backup-create.scss'
import {retrieveRecentAccount} from '../../storage/account-storage'
import accountManager from '../../state/account-manager'

class BackupView extends React.Component {
    constructor(props) {
        super(props)
    }

    async backup() {
        const activeAccountId = retrieveRecentAccount()
        const activeAccount = accountManager.get(activeAccountId)

        const credentials = await activeAccount.getCredentials(false)

        const encryptedKeypairs = Crypto.AES.encrypt(JSON.stringify(activeAccount.keypairs), credentials.account.id + credentials.password).toString()

        const now = new Date()
        const a = document.createElement('a')
        const file = new Blob([encryptedKeypairs], {type: 'text/plain;charset=utf-8'})
        a.href = URL.createObjectURL(file)
        a.download = `albedo_backup_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${credentials.account.id}.bak`
        a.click()
    }

    render() {
        return <span className={styles.mainContainer}>
          <a onClick={this.backup}>backup</a>
        </span>
    }
}

export default BackupView
