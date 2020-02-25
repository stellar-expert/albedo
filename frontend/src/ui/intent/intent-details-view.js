import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import Signatures from './tx-singatures-list-view'
import TxSigningStatus from './tx-signing-status-view'
import IntentTextDescription from './intent-text-description-view'
import AccountAddress from '../components/account-address'

const riskLevels = {
    low: {
        color: 'primary',
        icon: 'info-circle'
    },
    medium: {
        color: 'warning',
        icon: 'exclamation-triangle '
    },
    high: {
        color: 'danger',
        icon: 'exclamation-circle'
    }
}

function IntentContextIconView({color, main, sub}) {
    return <span className={`stacked-icon`}>
        <span className={`fa fa-fw fa-${main} main`}/>
        {sub && <span className={`fa fa-fw fa-${sub} sub color-${color}`}/>}
    </span>
}

function RiskLevelIconView({risk}) {
    const level = riskLevels[risk]
    return <IntentContextIconView color={level.color} main="envelope-open-o" sub={level.icon}/>
}

function IntentDetailsView({expanded}) {
    const {intentProps, intentErrors, txContext} = actionContext,
        {title, risk, personalData, unsafe} = intentProps,
        {app_origin, network, pubkey} = actionContext.intentParams

    return <div>
        <h2 style={{marginBottom: 0}}>{title}</h2>
        <div className="dimmed">
            Requested by <a href={app_origin || '#'} target="_blank">{app_origin || 'Unknown application'}</a>
        </div>
        <div className="space">
            <IntentContextIconView color="info" main="sitemap"/> Network: <b>{network || 'public'}</b>.
        </div>
        {!!pubkey &&
        <div>
            <IntentContextIconView color="warning" main="key" sub=""/> Public key: <AccountAddress account={pubkey}/>.
        </div>}
        <div>
            <RiskLevelIconView risk={risk}/> Risk level: <b>{risk}</b>.
        </div>
        {unsafe ?
            <div>
                <IntentContextIconView color="warning" main="shield" sub="exclamation-triangle"/> Potentially unsafe.
            </div> :
            <div>
                <IntentContextIconView color="primary" main="shield"/> Your funds are safe.
            </div>}
        {personalData ?
            <div>
                <IntentContextIconView color="warning" main="id-card-o" sub="key"/> The application requested access to
                your personal data (email and avatar).
            </div> :
            <div>
                <IntentContextIconView color="primary" main="id-card-o" sub="lock"/> Personal data won't be shared.
            </div>}
        {txContext && txContext.signatures.length > 0 &&
        <div>
            <IntentContextIconView color="info" main="pen"/> Signatures: <Signatures/>
        </div>}
        {(intentErrors || expanded) && <div className="space text-small"><IntentTextDescription/></div>}
        <TxSigningStatus/>
    </div>
}

IntentDetailsView.propTypes = {
    expanded: PropTypes.bool
}

export default observer(IntentDetailsView)
