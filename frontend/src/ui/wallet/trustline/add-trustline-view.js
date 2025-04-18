import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {StrKey} from '@stellar/stellar-base'
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

    const confirmCreateTrustline = useCallback(() => {
        setInProgress(true)
        createTrustline(asset, network)
            .then(() => {
                navigation.navigate('/account')
            })
            .finally(() => setInProgress(false))
    }, [asset, network])

    return <>
        <h3>Add trustline</h3>
        <hr className="flare"/>
        <WalletPageActionDescription>
            establish trustline to hold and transfer tokens
        </WalletPageActionDescription>
        <div>
            <div className="segment text-center space">
                {!direct && !!isValid && <div>
                    Asset <AssetLink asset={asset}/>
                    <div className="space"/>
                </div>}
                <AssetSelector value={asset} onChange={select} title={(!isValid ? 'Choose' : 'Change') + ' an asset'}/>or{' '}
                <a href="#" onClick={() => setDirect(true)}>provide asset parameters</a>
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
            </div>
            {isValid && isTrustlineExists && <div className="segment segment-inline warning space text-small">
                <span className="icon-warning"/> The trustline to this asset already exists
            </div>}
            <div className="dimmed text-tiny space">
                Before your account can hold an asset, you need to establish a trustline for this asset.
                Each trustline locks an account’s XLM reserve by 0.5 XLM and tracks the balance of the asset.
            </div>
            {inProgress && <ActionLoaderView message="in progress"/>}
            {!inProgress && <div className="row space">
                <div className="column column-50">
                    <Button block disabled={!isValid || isTrustlineExists} onClick={confirmCreateTrustline}>Add trustline</Button>
                </div>
                <div className="column column-50">
                    <Button href="/account" block outline>Cancel</Button>
                </div>
            </div>}
        </div>
    </>
}

export async function createTrustline(asset, network) {
    const validationResult = validateAddTrustline(asset)
    if (validationResult)
        return alert(validationResult)
    await confirm(<div className="text-small">
        Asset trustline will temporarily lock 0.5 XLM on your account balance.
        Would you like to add this asset?
    </div>, {confirmTitle: 'Create', title: <>Create trustline for <AssetLink asset={asset}/></>})
    const tx = await prepareAddTrustlineTx(asset, network)
    if (!tx)
        return
    await confirmTransaction(network, tx)
    notify({type: 'success', message: 'Trustline created'})
}

export default observer(AddTrustlineView)