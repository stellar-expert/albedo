import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import authorizationService from '../../state/authorization'
import AuthRequestView from '../authentication/authorization-request-view'
import './dialog-container.scss'

function DialogContainerView({children}) {
    if (!authorizationService.dialogOpen) return null
    return <div className="dialog">
        <div className="dialog-backdrop"/>
        <div className="dialog-content container">
            <div className="container">
                <AuthRequestView/>
            </div>
        </div>
    </div>
}

DialogContainerView.propTypes = {children: PropTypes.any}

export default observer(DialogContainerView)