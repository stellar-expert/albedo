import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import actionContext from '../../state/action-context'
import Signatures from './tx-signatures-list-view'
import TxSigningStatus from './tx-partial-signed-status-view'
import IntentTextDescription from './intent-text-description-view'

const riskLevels = {
    low: {
        color: 'primary',
        icon: 'info'
    },
    medium: {
        color: 'warning',
        icon: 'warning'
    },
    high: {
        color: 'danger',
        icon: 'warning'
    }
}

function IntentContextIconView({color, main, sub}) {
    return <span className="stacked-icon">
        <span className={`icon-${main} main`}/>
        {sub && <span className={`icon-${sub} sub color-${color}`}/>}
    </span>
}

function RiskLevelIconView({risk}) {
    const level = riskLevels[risk]
    return <IntentContextIconView color={level.color} main="email" sub={level.icon}/>
}

function IntentDetailsView({expanded}) {
    const {intentProps, intentErrors, txContext, networkName, origin} = actionContext
    if (!intentProps) return null
    const {title, risk, unsafe} = intentProps,
        {pubkey} = actionContext.intentParams

    return <div>
        <h2 style={{marginBottom: 0}}>{title}</h2>
        <div className="dimmed">
            Requested by <a href={origin || '#'} target="_blank">{origin || 'Unknown application'}</a>
        </div>
        <div className="space">
            <IntentContextIconView color="info" main="cubes"/> Network: <b>{networkName}</b>
        </div>
        {!!pubkey &&
        <div>
            <IntentContextIconView color="warning" main="key" sub=""/> Public key: <AccountAddress account={pubkey}/>
        </div>}
        <div>
            <RiskLevelIconView risk={risk}/> Risk level: <b>{risk}</b>
        </div>
        {unsafe ?
            <div>
                <IntentContextIconView color="warning" main="search" sub="warning"/> Potentially unsafe
            </div> :
            <div>
                <IntentContextIconView color="primary" main="search"/> Your funds are safe
            </div>}
        {(intentErrors || expanded) && <div className="space text-small">
            <IntentTextDescription/>
            <div className="space"/>
        </div>}
        {txContext && txContext.signatures.length > 0 && <div>
            <hr className="flare"/>
            <h4>Signatures:</h4>
            <Signatures/>
            <div className="space"/>
        </div>}
        <TxSigningStatus/>
    </div>
}

IntentDetailsView.propTypes = {
    expanded: PropTypes.bool
}

export default observer(IntentDetailsView)
