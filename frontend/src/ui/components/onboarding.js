import React from 'react'
import PropTypes from 'prop-types'

const OnboardingSteps = [
    <>
        <p>Albedo provides a safe and reliable way to use Stellar accounts without
            trusting anyone with your secret key. It works like a bridge for
            other applications that allows them to ask your permission to sign transactions
            or verify identity on your behalf, so you can use the same account across the
            whole universe of Stellar applications.
        </p>
        <p>
            Security is paramount for us. In fact, it's a primary aspect of Albedo.
            We don't have access to any sensitive data, everything is encrypted with your email+password
            combination. After encryption it is stored in the browser, as well as on our servers in a
            fully trustless manner. It means that we'll never have access to even the tiniest bit
            of your personal information, your keys, or your email.
        </p>
        <p>
            Albedo is open-source and free to use for everyone.
        </p>
    </>,
    <>
        <p>
            Your information and funds are protected, but please remember
            <ul className="list">
                <li>You and only you control your data</li>
                <li>Albedo is not a wallet, bank, or exchange</li>
                <li>We don't control your keys or you funds</li>
                <li>We can't undo your transaction or recover keys/passwords</li>
            </ul>
        </p>
        <p>
            So write down your password somewhere and keep it safe.
            Avoid storing it on your phone or computer. And do not forget to make backups.
        </p>
    </>
]

class Onboarding extends React.Component {
    state = {
        step: 0
    }

    static propTypes = {
        onFinish: PropTypes.func.isRequired
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
        if (step > this.maxStep) {
            this.props.onFinish && this.props.onFinish()
        }
    }

    render() {
        const {step} = this.state
        if (step > this.maxStep) return null
        return <>
            <h2>SignUp - Introduction</h2>
            {OnboardingSteps[step]}
            <div className="text-right">
                <button className="button" onClick={() => this.nextStep()}>Next</button>
                {step < this.maxStep &&
                <button className="button button-outline" onClick={() => this.nextStep(this.maxStep)}>
                    Skip introduction
                </button>}
            </div>
            <div style={{clear: 'both'}}/>
        </>
    }
}

export default Onboarding
