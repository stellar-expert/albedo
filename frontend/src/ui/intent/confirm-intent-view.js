import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import ActionsBlock from '../components/actions-block'

function ConfirmIntentView() {
    return <ActionsBlock>
        {!actionContext.intentErrors && <button className="button" onClick={() => actionContext.confirmRequest()}>Confirm</button>}
        {' '}
        <button className="button button-outline" onClick={() => actionContext.rejectRequest()}>Reject</button>
    </ActionsBlock>
}

export default observer(ConfirmIntentView)