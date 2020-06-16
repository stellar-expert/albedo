import React, {useState, useRef, useEffect} from 'react'
import {StrKey} from 'stellar-sdk'
import {mnemonicWordsList, validateMnemonic, mnemonicToSecret} from '../../util/mnemonic'
import SignupView from '../signup/signup-view'

function processImportedKey(value) {
    value = (value || '').trim()
    const words = value.toLowerCase().split(/\s+/g)
    if (words.length > 20 && words.length < 26) {
        const res = {
            type: 'passphrase'
        }
        if (words.length !== 24) {
            res.error = 'Account passphrase backup must consist of 24 words'
            return res
        }
        for (const word of words)
            if (!mnemonicWordsList.includes(word)) {
                res.error = `Invalid word "${word}"`
                return res
            }
        if (!validateMnemonic(value)) {
            res.error = 'Invalid backup phrase – check the order of words'
            return res
        }
        //looks like it's all good
        res.value = words.join(' ')
        res.secret = mnemonicToSecret(value)
        return res
    }
    if (/^S\w{52,58}/.test(value)) {
        value = value.toUpperCase()
        const res = {
            type: 'account secret'
        }
        if (value.length !== 56) {
            res.error = 'Secret key must contain exactly 56 characters'
            return res
        }
        if (!StrKey.isValidEd25519SecretSeed(value)) {
            res.error = 'Invalid secret key – check all characters'
            return res
        }
        //looks good
        res.value = res.secret = value
        return res
    }
    return {
        type: 'unknown'
    }
}

export default function AccountImportView({onSuccess}) {
    const [pastedValue, pasteValue] = useState(''),
        [error, setError] = useState(null),
        [secretToImport, setSecret] = useState(null),
        inputRef = useRef(null)

    useEffect(() => inputRef.current && inputRef.current.focus(), [])

    function submit(value) {
        const {type, secret, error} = processImportedKey(value || pastedValue)
        if (secret) return setSecret(secret)
        setError({type, details: error})
    }

    if (secretToImport) return <SignupView secret={secretToImport} skipSecretBackup/>

    return <>
        <h2>Import Account</h2>
        <div className="text-small space">
            <p>
                Use this tool to import keys from any Stellar wallet or transfer your Albedo account to another
                browser/device.
            </p>
            <p>
                <i className="fa fa-warning"/>{' '}
                Before starting the import process, do not forget to double-check the URL(the domain should
                be <b>albedo.link</b>) and SSL validity(a small lock icon on the left of the address bar).
            </p>
            <p>
                Copy-paste your key below. Supported formats:<br/>
                - 24-word Albedo account passphrase backup<br/>
                - Stellar account secret key (starts with "S…")
            </p>
        </div>
        <div className="micro-space"/>
        <textarea value={pastedValue} style={{height: '5.2em', fontWeight: 'bold'}}
                  ref={c => inputRef.current = c} onChange={e => {
                      pasteValue(e.target.value)
                      setError(null)
                  }}/>
        <div className="row">
            <div className="column column-50">
                <button className="button button-block" onClick={() => submit()}>Next</button>
            </div>
            <div className="column column-50">
                <button className="button button-outline button-block" onClick={() => __history.push('/')}>Cancel
                </button>
            </div>
        </div>
        {error && <div className="space error text-small">
            {error.type === 'unknown' ? 'Invalid key format. Use either 24-word passphrase or Stellar secret key.' : <>
                Auto-detected import type: <b>{error.type}</b><br/>
                Error: {error.details}
            </>}
        </div>}
    </>
}