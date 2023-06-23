import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {StrKey} from 'stellar-sdk'
import {Button, AssetLink, useStellarNetwork, AssetSelector} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {confirmTransaction} from '../shared/wallet-tx-confirmation'
import ActionLoaderView from '../shared/action-loader-view'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import {prepareAddTrustlineTx, validateAddTrustline} from './add-trustline-tx-builder'

function AddTrustlineView() {
    const [asset, setAsset] = useState(navigation.query.asset || '')
    const [direct, setDirect] = useState(false)
    const [inProgress, setInProgress] = useState(false)
    const network = useStellarNetwork()
    const isTrustlineExists = accountLedgerData.balances[asset] !== undefined
    const [code = '', issuer = ''] = asset.split('-')
    const isValid = /^[a-zA-Z0-9]{1,12}$/.test(code) && StrKey.isValidEd25519PublicKey(issuer)

    function updateAsset(asset) {
        setAsset(asset)
        navigation.updateQuery({asset})
    }

    function select(value) {
        updateAsset(value)
        setDirect(false)
    }

    function change(code = '', issuer = '') {
        updateAsset(`${code}-${issuer}-${code.length > 4 ? 2 : 1}`)
    }

    function createTrustline() {
        const validationResult = validateAddTrustline(asset)
        if (validationResult) return alert(validationResult)
        if (!confirm(`Asset trustline will temporarily lock 0.5 XLM on your account balance.
Would you like to add this asset?`)) return
        prepareAddTrustlineTx(asset, network)
            .then(tx => {
                if (!tx) return
                setInProgress(true)
                return confirmTransaction(network, tx)
                    .then(() => navigation.navigate('/account'))
                    .finally(() => setInProgress(false))
            })
    }

    return <>
        <h3>Add trustline</h3>
        <hr className="flare"/>
        <WalletPageActionDescription>
            establish trustline to hold and transfer tokens
        </WalletPageActionDescription>
        <div>
            <div className="space segment">
                <AssetSelector value={asset} onChange={select} title="Choose an asset"/>or provide
                asset parameters <a href="#" onClick={() => setDirect(true)}>manually</a>
                {direct && <>
                    <hr className="flare"/>
                    <div>
                        <input type="text" maxLength={12} value={code} placeholder="Asset code"
                               onChange={e => change(e.target.value, issuer)}/>
                    </div>
                    <div>
                        <input type="text" maxLength={56} value={issuer} placeholder="Asset issuer"
                               onChange={e => change(code, e.target.value)}/>
                    </div>
                </>}
                {!direct && <div className="space text-center">
                    {!!isValid ?
                        <>Asset <AssetLink asset={asset}/></> :
                        <span className="dimmed text-small">(asset not selected)</span>
                    }
                </div>}
            </div>
            {isValid && isTrustlineExists && <div className="segment warning space text-small">
                <span className="icon-warning"/> The trustline to this asset already exists
            </div>}
            <div className="dimmed text-tiny space">
                Before your account can hold an asset, you need to establish a trustline for this asset.
                Each trustline locks an account’s XLM reserve by 0.5 XLM and tracks the balance of the asset.
            </div>
            {inProgress && <ActionLoaderView message="in progress"/>}
            {!inProgress && <div className="row space">
                <div className="column column-50">
                    <Button block disabled={!isValid || isTrustlineExists} onClick={createTrustline}>Add trustline</Button>
                </div>
                <div className="column column-50">
                    <Button href="/account" block outline>Cancel</Button>
                </div>
            </div>}
        </div>
    </>
}

export default observer(AddTrustlineView)