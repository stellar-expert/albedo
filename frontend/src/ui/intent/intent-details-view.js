import React from 'react'
import {observer} from 'mobx-react'
import {intentInterface} from '@albedo-link/intent'
import actionContext from '../../state/action-context'
import Signatures from './tx/tx-signatures-list-view'
import TxPartialSignedStatusView from './tx/tx-partial-signed-status-view'
import IntentTextDescription from './intent-text-description-view'
import IntentErrorView from './intent-error-view'

function IntentRequestDetailsView({intentRequest, expanded, multi = false}) {
    const {intent, intentParams, txContext} = intentRequest
    const title = intentInterface[intent].title

    return <div>
        {multi ?
            <h3 style={{marginBottom: 0}}>{title}</h3> :
            <h2>{title}</h2>}
        <IntentTextDescription intent={intent} intentParams={intentParams} expanded={expanded} multi={multi}/>
        <div className="space"/>
        {txContext && txContext.signatures.length > 0 && <div>
            <hr className="flare"/>
            <h4>Signatures:</h4>
            <Signatures txContext={txContext}/>
            <div className="space"/>
        </div>}
        <TxPartialSignedStatusView txContext={txContext}/>
    </div>
}

function IntentDetailsView({expanded = false}) {
    const {intentErrors, intentParams, intentRequests} = actionContext,
        multi = intentParams?.intent === 'batch'

    if (intentErrors) {
        return <>
            <IntentErrorView/>
            <div className="space"/>
        </>
    }
    return <>
        {multi && <>
            <h2 style={{marginBottom: 0}}>Transactions group</h2>
        </>}
        {intentRequests.map((ir, i) =>
            <IntentRequestDetailsView key={i} intentRequest={ir} expanded={expanded} multi={multi}/>)}
    </>
}

export default observer(IntentDetailsView)
