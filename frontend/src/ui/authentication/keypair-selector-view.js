import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import {observer} from 'mobx-react'
import accountManager from '../../state/account-manager'
import actionContext from '../../state/action-context'
import AccountKeypair from '../../state/account-keypair'
import {findSignatureByKey} from '../../util/signature-hint-utils'
import './keypair-selector.scss'

/**
 *
 * @param {AccountKeypair} keyPair
 * @returns {Promise<void>}
 */
async function selectKeypair(keyPair) {
    try {
        accountManager.setSelectedKeypair(keyPair)
        await actionContext.confirmRequest()
    } catch (err) {
        throw new Error(err)
    }
}

function KeyPairSelectorView() {
    const {activeAccount} = accountManager,
        {txContext, intentParams} = actionContext,
        {pubkey: requestedKey} = intentParams,
        {signatures} = txContext || {}
    if (!activeAccount) return null

    return <div className="keypair-selector-view">
        <div className="space">
            {activeAccount.keypairs.map(keyPair => {
                const {publicKey} = keyPair,
                    alreadySigned = !!findSignatureByKey(publicKey, signatures),
                    className = cn('button', {disabled: alreadySigned})
                return <button title={publicKey} key={publicKey} className={className}
                               disabled={requestedKey && publicKey !== requestedKey}
                               onClick={() => !alreadySigned && selectKeypair(keyPair)}>
                    {alreadySigned && <i className="fa fa-check" style={{fontSize: '0.7em'}}/>} {keyPair.displayName}
                </button>
            })}
        </div>
    </div>
}

export default observer(KeyPairSelectorView)