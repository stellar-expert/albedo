import React, {useCallback, useRef} from 'react'
import PropTypes from 'prop-types'
import {Button, useDependantState} from '@stellar-expert/ui-framework'
import {ACCOUNT_TYPES} from '../../state/account'

const defaultState = {
    password: '',
    confirmation: ''
}

export default function CredentialsRequestView({
                                                   confirmText = 'Confirm',
                                                   onConfirm,
                                                   onCancel,
                                                   requestPasswordConfirmation,
                                                   inProgress,
                                                   noRegistrationLink
                                               }) {
    const firstInputRef = useRef(null)

    const focusFirstInput = useCallback(() => {
        setTimeout(() => {
            const input = firstInputRef.current
            if (input)
                input.focus()
        }, 200)
    }, [])

    const [{password, confirmation}, updateState] = useDependantState(() => {
        focusFirstInput()
        return {...defaultState}
    }, [confirmText, onConfirm, onCancel, requestPasswordConfirmation, noRegistrationLink])

    //derive from current values so it stays in sync after form resets
    const isValid = (password || '').length >= 8 &&
        (!requestPasswordConfirmation || password === confirmation)

    const confirm = useCallback(() => {
        updateState({...defaultState})
        onConfirm({password, type: ACCOUNT_TYPES.STORED_ACCOUNT})
    }, [password, onConfirm, updateState])

    const onKeyDown = useCallback((e) => {
        //handle Esc key
        if (e.keyCode === 27 && onCancel) {
            onCancel()
        }
        //handle Enter key — gated on isValid to match the disabled Confirm button
        if (e.keyCode === 13 && isValid) {
            confirm()
        }
    }, [onCancel, confirm, isValid])

    const setValue = useCallback((name, value) => {
        updateState(current => ({...current, [name]: value}))
    }, [updateState])

    return <>
        <div className="segment">
            <div>
                <input type="password" name="password" placeholder="Password"
                       ref={firstInputRef} value={password || ''} onChange={e => setValue('password', e.target.value)}
                       onKeyDown={onKeyDown}/>
            </div>
            {requestPasswordConfirmation && <div>
                <input type="password" name="confirmation" placeholder="Password confirmation"
                       value={confirmation || ''} onChange={e => setValue('confirmation', e.target.value)}
                       onKeyDown={onKeyDown}/>
            </div>}
        </div>
        <div className="row actions space">
            {onConfirm && <div className="column column-50">
                <Button block disabled={!!inProgress || !isValid} onClick={confirm}>{confirmText}</Button>
            </div>}
            {onCancel && <div className="column column-50">
                <Button block outline onClick={onCancel}>Cancel</Button>
            </div>}
        </div>
        {!noRegistrationLink && <>
            <hr title="not registered yet?" className="flare"/>
            <div className="row">
                <div className="column column-50 column-offset-25">
                    <Button block href="/signup">Create new account</Button>
                </div>
            </div>
        </>}
    </>
}

CredentialsRequestView.propTypes = {
    //text to display as a Confirm button caption
    confirmText: PropTypes.string,
    //user presses Enter key
    onConfirm: PropTypes.func.isRequired,
    //user presses Esc key
    onCancel: PropTypes.func.isRequired,
    //request password confirmation
    requestPasswordConfirmation: PropTypes.bool,
    //action is in progress
    inProgress: PropTypes.bool,
    //whether to show "create account" link or not
    noRegistrationLink: PropTypes.bool
}
