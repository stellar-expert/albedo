import React, {useState} from 'react'
import {observer} from 'mobx-react'
import {Button, AssetLink, useStellarNetwork, AssetSelector} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import {isValidPoolId} from '@stellar-expert/asset-descriptor'
import accountLedgerData from '../../../state/ledger-data/account-ledger-data'
import {confirmTransaction} from '../shared/wallet-tx-confirmation'
import WalletPageActionDescription from '../shared/wallet-page-action-description'
import ActionLoaderView from '../shared/action-loader-view'
import {prepareRemoveTrustlineTx, validateRemoveTrustline} from './remove-trustline-tx-builder'

function RemoveTrustlineView() {
    const [convertAsset, setConvertAsset] = useState(null)
    const [inProgress, setInProgress] = useState(false)
    const network = useStellarNetwork()
    const asset = navigation.query.asset
    if (!Object.keys(accountLedgerData.balances).length)
        return null

    const assetBalance = accountLedgerData.balances[asset]
    const predefinedAssets = Object.keys(accountLedgerData.balances).filter(a => a !== 'XLM' && a !== asset && !isValidPoolId(a))
    predefinedAssets.unshift('XLM')

    async function removeTrustline() {
        const validationResult = validateRemoveTrustline(asset)
        if (validationResult)
            return alert(validationResult)
        await confirm('Are you sure you want to remove this trustline?', {title: 'Remove trustline'})
        setInProgress(true)
        try {
            const tx = await prepareRemoveTrustlineTx({asset, convertAsset, network})
            if (!tx)
                return
            setInProgress(true)
            await confirmTransaction(network, tx)
            navigation.navigate('/account')
        } catch (e) {
            console.error(e)
            notify({type: 'warning', message: 'Failed to remove trustline'})
        }
        setInProgress(false)
    }

    if (!asset)
        return null

    return <>
        <h3>Remove trustline</h3>
        <hr className="flare"/>
        <WalletPageActionDescription>
            discard tokens amd remove asset trustline
        </WalletPageActionDescription>
        <div>
            <div className="space segment">
                Remove trustline to asset <AssetLink asset={asset}/>
                {assetBalance.balance > 0 && <div className="space text-small">
                    <label className="text-small" style={{display: 'inline'}}>
                        <input type="checkbox" checked={!!convertAsset} onChange={e => setConvertAsset(e.target.checked ? 'XLM' : null)}/>
                        {' '}Convert remaining tokens to
                    </label>{' '}
                    <AssetSelector value={convertAsset} onChange={setConvertAsset} restricted predefinedAssets={predefinedAssets}
                                   title={convertAsset ? <AssetLink asset={convertAsset} link={false}/> : 'another asset'}/>
                </div>}
            </div>
            {inProgress && <ActionLoaderView message="in progress"/>}
            {!inProgress && <>
                {!assetBalance ?
                    <div className="segment segment-inline warning space text-small">
                        <span className="icon-warning"/> The trustline doesn't exist
                    </div> :
                    <div className="dimmed text-tiny space">
                        {assetBalance.balance > 0 ?
                            <>
                                All remaining tokens will be {convertAsset ?
                                <>converted to <AssetLink asset={convertAsset}/></> :
                                <>sent to the issuer account</>}, the trustline will be removed.
                            </> :
                            <>Trustline has zero balance and is safe to remove.</>}
                    </div>}
                <div className="row space">
                    <div className="column column-50">
                        <Button block disabled={!assetBalance} onClick={removeTrustline}>Remove trustline</Button>
                    </div>
                    <div className="column column-50">
                        <Button href="/account" block outline>Cancel</Button>
                    </div>
                </div>
            </>}
        </div>
    </>
}

export default observer(RemoveTrustlineView)