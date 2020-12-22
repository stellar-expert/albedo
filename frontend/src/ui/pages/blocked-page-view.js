import React from 'react'
import {parseQuery} from '../../util/url-utils'

export default function BlockedPageView() {
    const {from = ''} = parseQuery()
    return <div className="v-center-block" style={{minHeight: '80vh'}}>
        <h2>Domain <b>{from}</b> blocked</h2>
        <div className="warning-block">
            <i className="fa fa-warning color-warning"/> The domain you were trying to access has been reported earlier
            for a fraudulent activity.
            Albedo automatically blocks such websites to protect our users from malicious actions.
        </div>
        <div className="text-small dimmed">
            If you think that the domain {from} was added to the blocklist by mistake, please contact us at{' '}
            <a href="mailto:info@stellar.expert" target="_blank">info@stellar.expert</a>
        </div>
    </div>
}