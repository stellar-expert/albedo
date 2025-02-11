import React, {useCallback, useState} from 'react'
import {observer} from 'mobx-react'
import {Button, useStellarNetwork} from '@stellar-expert/ui-framework'
import ActionLoaderView from '../shared/action-loader-view'
import {confirmSpending} from '../shared/spending-confirmation-view'
/**
 * @param {Bool} disabled
 * @param {Object} swap
 * @param {Function} prepareTransaction
 * @param {Function} onFinalize
 * @constructor
 */
export default observer(function StellarBrokerConfirmationView({swap}) {
    const network = useStellarNetwork()
    const disabled = !swap.isValid || !swap.conversionFeasible || swap.inProgress

    const confirmSmartSwap = useCallback(async () => {
        try {
            swap.confirmSmartRouterSwap()
        } catch (e) {
            if (e.code === -4)
                return

            notify({
                type: 'error',
                message: `Failed to execute the swap.`
            })
        }
    }, [network])

    const proceed = useCallback(() => {
        confirmSpending({
            kind: 'swap',
            asset: swap.asset[0],
            amount: swap.amount[0]
        })
            .then(confirmSmartSwap)
    }, [confirmSmartSwap])

    return <>
        <div className="row space">
            <div className="column column-50">
                <Button block disabled={disabled} loading={swap.inProgress} onClick={proceed}>Swap</Button>
            </div>
            <div className="column column-50">
                <Button href="/" block outline>Cancel</Button>
            </div>
        </div>
    </>
})