import React from 'react'
import {Button} from '@stellar-expert/ui-framework'

export default function OnBoardingNotesStepView({onSuccess}) {
    return <>
        <p>
            Albedo provides a safe and reliable way to use Stellar accounts without trusting anyone with your secret
            key. We don't have access to any sensitive data, everything is encrypted and stored in the browser.
        </p>
        <p>
            It works like a bridge for other applications that allows them to ask your permission to sign transactions
            or verify identity on your behalf, so you can use the same account across the whole universe of Stellar
            applications. Albedo is open-source and free to use for everyone.
        </p>
        <p>
            Your information and funds are protected, but please remember:
            <ul className="list">
                <li>You and only you control your account</li>
                <li>Albedo is not a wallet, bank, or exchange</li>
                <li>We don't control your keys or you funds</li>
                <li>We can't undo your transaction or recover keys/passwords</li>
            </ul>
        </p>
        <div className="row space">
            <div className="column column-50 column-offset-25">
                <Button block onClick={onSuccess}>Proceed <i className="icon-angle-right"/></Button>
            </div>
        </div>
    </>
}