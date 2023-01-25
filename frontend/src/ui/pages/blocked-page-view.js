import React from 'react'
import {parseQuery} from '@stellar-expert/navigation'
import SoloLayoutView from '../layout/solo-layout-view'

export default function BlockedPageView() {
    const {from = ''} = parseQuery()
    return <SoloLayoutView title="Domain Blocked">
        <div className="warning-block">
            <i className="icon-warning-hexagon color-warning"/> The domain <code>{from.toLowerCase()}</code> has been reported earlier
            for a fraudulent activity.
            Albedo automatically blocks such websites to protect our users from malicious actions.
            <div className="space text-small">
                <i className="icon-warning-hexagon color-warning"/> Please note: There is no stacking on Stellar.
                Any website promoting "stacking competitions" will steal your funds.
            </div>
        </div>
        <div className="text-small dimmed">
            If you think that the domain {from} was added to the blocklist by mistake, please contact us at{' '}
            <a href="mailto:info@stellar.expert" target="_blank">info@stellar.expert</a>
        </div>
    </SoloLayoutView>
}