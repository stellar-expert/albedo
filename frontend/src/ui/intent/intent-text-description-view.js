import React from 'react'
import {observer} from 'mobx-react'
import {AccountAddress, AssetLink, Amount} from '@stellar-expert/ui-framework'
import {parseAssetFromObject} from '@stellar-expert/asset-descriptor'
import {intentInterface} from '@albedo-link/intent'
import actionContext from '../../state/action-context'
import TxDetailsView from './tx/tx-details-view'

function CallerOrigin() {
    const {origin} = actionContext
    return <a href={origin || '#'} target="_blank">{origin || 'Unknown application'}</a>
}

function NetworkInfo() {
    const {intentParams, networkParams} = actionContext
    return <>
        {!['public_key', 'sign_message'].includes(intentParams.intent) && <div className="text-small">
            <span className="dimmed">Network:</span>{' '}
            <span className="icon icon-info dimmed"/>
            {networkParams.networkName}
        </div>}
    </>
}

function IntentDescriptionLayout({text, children, submit, multi}) {
    return <div>
        <div className="text-small">
            {!multi && <NetworkInfo/>}
            <CallerOrigin/> {text}.
            {!!submit && <div className="dimmed">
                <i className="icon icon-export"/>Transaction will be submitted automatically
            </div>}
        </div>
        {!!children && <>{children}</>}
    </div>
}

function IntentTextDescriptionView({intent, intentParams, expanded = true, multi = false}) {
    switch (intent) {
        case 'public_key':
            return <IntentDescriptionLayout text="requested your Stellar account public key"/>
        case 'sign_message':
            return <IntentDescriptionLayout text="requested permission to sign a message">
                {expanded && <div className="space">
                    <span className="label">Message: </span>
                    <code className="word-break">{intentParams.message}</code>
                </div>}
            </IntentDescriptionLayout>
        case 'tx':
            return <IntentDescriptionLayout text="requested permissions to sign a transaction" multi={multi} submit={intentParams.submit}>
                {expanded && <>
                    {!!intentParams.description && <div>
                        "{intentParams.description.length < 30 ?
                        intentParams.description :
                        intentParams.description.substring(0, 46).trim() + '…'}"
                    </div>}
                    <TxDetailsView xdr={intentParams.xdr} network={actionContext.networkParams.network}/>
                </>}
            </IntentDescriptionLayout>
        case 'trust':
            return <IntentDescriptionLayout text="requested a trustline creation" submit={intentParams.submit}>
                {expanded && <div className="space">
                    Asset <AssetLink asset={parseAssetFromObject(intentParams)}/>
                </div>}
            </IntentDescriptionLayout>
        case 'pay':
            return <IntentDescriptionLayout text="requested a payment" submit={intentParams.submit}>
                {expanded && <div className="space">
                    <Amount amount={intentParams.amount} asset={parseAssetFromObject(intentParams)}/>{' '}
                    <span className="icon icon-angle-double-right"/> <AccountAddress account={intentParams.destination}/>
                </div>}
            </IntentDescriptionLayout>
        case 'exchange':
            return <IntentDescriptionLayout text="requested permission to swap assets" submit={intentParams.submit}>
                {expanded && <div className="space">
                    <Amount amount={intentParams.amount} asset={parseAssetFromObject(intentParams)} prefix="buy_"/>{' '}
                    <span className="icon icon-shuffle"/>{' '}
                    <AssetLink asset={parseAssetFromObject(intentParams, 'sell_')}/>
                    <div className="text-small dimmed">
                        Max price {intentParams.max_price} {intentParams.sell_asset_code || 'XLM'}/{intentParams.buy_asset_code || 'XLM'}
                    </div>
                </div>}
            </IntentDescriptionLayout>
        case 'implicit_flow':
            let {intents} = intentParams
            if (typeof intents === 'string') {
                intents = intents.split(',')
                    .map(i => i.trim().toLowerCase())
                    .filter(i => !!i)
            }
            return <IntentDescriptionLayout
                text="requested temporary permission to execute the following actions without confirmation dialog">
                {expanded && <div className="space">
                    <ul>
                        {intents.map(intentRequest => <li key={intentRequest}>
                            <i className="icon-angle-double-right"/>
                            <b>{intentInterface[intentRequest].title}</b>
                        </li>)}
                    </ul>
                    <div className="dimmed text-small">
                        Any granted permission will expire in one hour. Once you close the application, all permissions will
                        be automatically revoked.
                    </div>
                </div>}
            </IntentDescriptionLayout>
        case 'batch':
            return <>
                <NetworkInfo/>
            </>
    }
    return <span className="error">
        Unknown intent: {intent}.
    </span>
}

export default observer(IntentTextDescriptionView)