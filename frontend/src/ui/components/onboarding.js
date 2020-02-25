import React from 'react'
import Lightbox from '../components/lightbox'

const OnboardingSteps = [
    <div>
        <h2>Introducing Albedo</h2>

        <p>Albedo provides a safe and reliable way to use your Stellar accounts without
            trusting anyone with your secret key. Think of it as a bridge for
            other applications that allows them to ask your permission to sign transactions
            or verify identity on your behalf. You have one account and use it across the
            whole universe of Stellar applications. Albedo is open-source and free to use for everyone.
        </p>
        <p>
            Your security is paramount for us. In fact, it's a primary aspect of Albedo.
            We don't have access to any sensitive data, it is encrypted with your email + password
            combination. After encryption it is stored in the browser, as well as on our servers in a
            trustless manner. It means that we'll never have access to even the tiniest bit
            of your personal information, your keys, or your email.
        </p>
    </div>,

    <div>
        <h2>Responsibility</h2>
        <p>
            Your information and funds are protected, but please remember
            <ul>
                <li>You and only you control your data.</li>
                <li>Albedo is not a wallet, bank, or exchange.</li>
                <li>We don't control your keys or you funds.</li>
                <li>We can't undo your transaction or recover keys/passwords.</li>
            </ul>
        </p>
        <p>
            So write down your password somewhere and keep it safe.
            Avoid storing it on your phone or computer. And do not forget to make backups.
        </p>
    </div>

]

/*<div>
        <h2>Let's go!</h2>
        <p>Thanks for reading through our introduction! Now you're ready to dive in.</p>
    </div>*/

class Onboarding extends React.Component {
    state = {
        step: 0
    }

    get maxStep() {
        return OnboardingSteps.length - 1
    }

    nextStep(step) {
        if (!step) {
            step = this.state.step
        }
        step++
        this.setState({step})
        if (step >= this.maxStep) {
            localStorage.setItem('onBoardingPassed', 'true')
            this.props.onFinish && this.props.onFinish()
        }
    }

    render() {
        const {step} = this.state
        if (localStorage.getItem('onBoardingPassed') || step > this.maxStep) return null
        return <Lightbox>
            {OnboardingSteps[step]}
            <div className="text-right">
                <button className="button button-outline" onClick={() => this.nextStep(this.maxStep)}>
                    Skip introduction
                </button>
                <button className="button" onClick={() => this.nextStep()}>
                    {step !== this.maxStep ? 'Next' : 'Finish'}
                </button>

            </div>
            <div style={{clear: 'both'}}/>
        </Lightbox>
    }
}

export default Onboarding
