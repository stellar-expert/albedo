import React from 'react'
import {observer} from 'mobx-react'
import {Dialog} from '@stellar-expert/ui-framework'
import AuthRequestView from '../authentication/authorization-request-view'
import authorizationService from '../../state/auth/authorization'

function AuthDialogView() {
    if (!authorizationService.dialogOpen)
        return null
    return <Dialog dialogOpen>
        <AuthRequestView/>
    </Dialog>
}

export default observer(AuthDialogView)