import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {StrKey} from 'stellar-sdk'
import {Button, AssetLink, useStellarNetwork} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import AssetSelectorView from '../shared/asset-selector-view'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {confirmTransaction} from '../shared/wallet-tx-confirmation'
import {prepareAddTrustlineTx, validateAddTrustline} from './add-trustline-tx-builder'

function AddTrustlineView() {
    const [asset, setAsset] = useState(navigation.query.asset || ''),
        [direct, setDirect] = useState(false),
        [inProgress, setInProgress] = useState(false),
        network = useStellarNetwork(),
        isTrustlineExists = accountLedgerData.balances[asset] !== undefined,
        [code = '', issuer = ''] = asset.split('-'),
        isValid = /^[a-zA-Z0-9]{1,12}$/.test(code) && StrKey.isValidEd25519PublicKey(issuer)

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
        <div>
            <div className="space">
                <AssetSelectorView value={asset} onChange={select} title="Choose an asset"/>or provide
                asset parameters <a href="#" onClick={() => setDirect(true)}>manually</a>
            </div>
            {direct && <div className="space">
                <div>
                    <label className="dimmed text-small">Asset code
                        <input type="text" maxLength={12} value={code} onChange={e => change(e.target.value, issuer)}/>
                    </label>
                </div>
                <div>
                    <label className="dimmed text-small">Asset issuer
                        <input type="text" maxLength={56} value={issuer} onChange={e => change(code, e.target.value)}/>
                    </label>
                </div>
            </div>}
            <div className="dimmed text-small micro-space">
                Before your account can hold an asset, you need to establish a trustline for this asset.
                Each trustline locks an account’s XLM reserve by 0.5 XLM and tracks the balance of the asset.
            </div>
            {!direct && isValid && <div className="space">
                Asset <AssetLink asset={asset}/>
                {isTrustlineExists && <div className="segment warning space text-small">
                    <span className="icon-warning"/> The trustline to this asset already exists
                </div>}
            </div>}
            {inProgress && <div className="text-center dimmed text-tiny">
                <div className="loader"/>
                In progress...
            </div>}
            {!inProgress && <div className="row space">
                <div className="column column-50">
                    <Button href="/account" block outline>Cancel</Button>
                </div>
                <div className="column column-50">
                    <Button block disabled={!isValid || isTrustlineExists} onClick={createTrustline}>Add trustline</Button>
                </div>
            </div>}
        </div>
    </>
}

export default observer(AddTrustlineView)