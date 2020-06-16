import React, {useState, useEffect} from 'react'
import cn from 'classnames'
import PropTypes from 'prop-types'
import Credentials from '../../state/credentials'
import {secretToMnemonic} from '../../util/mnemonic'

function Note({yes, no, children}) {
    const className = cn('fa', {
        'fa-check-circle-o': yes,
        'color-success': yes,
        'fa-ban': no,
        'color-warning': no
    })
    return <li><i className={className}/> {children}</li>
}

function SecretBackupStepView({credentials, onSuccess}) {
    const [secret, setSecret] = useState(null)
    useEffect(function () {
        const {account} = credentials
        const secret = account.requestAccountSecret(credentials)
        setSecret(secret)
    }, [credentials.account.id])
    if (!secret) return null
    return <>
        <div className="text-small">
            Congratulations! Everything is set. Now you just need to back up your secret key.
        </div>
        <textarea className="space" readOnly value={secretToMnemonic(secret)} onFocus={e => e.target.select()}
                  style={{height: '5.2em', fontWeight: 'bold'}}/>
        <div className="text-small">
            <p>
                This 24-word recovery phrase is the backup of your secret key.
                It can be used to restore your account anytime and on any device.
            </p>
            <ul>
                <Note yes>Write down this passphrase and keep it safe.</Note>
                <Note yes>Storing backups in multiple places is a good idea.</Note>
                <Note yes>Use a password manager or encrypted drive.</Note>
            </ul>
            <ul>
                <Note no>Never share the passphrase, or you may lose funds.</Note>
                <Note no>Avoid keeping it on a phone/computer in plaintext.</Note>
                <Note no>Do not trust any person or website asking it.</Note>
            </ul>
        </div>
        <div className="row space">
            <div className="column column-50 column-offset-25">
                <button className="button" onClick={onSuccess}>I saved recovery phrase <i className="fa fa-angle-right"/>
                </button>
            </div>
        </div>
    </>
}

SecretBackupStepView.propTypes = {
    credentials: PropTypes.instanceOf(Credentials).isRequired
}

export default SecretBackupStepView