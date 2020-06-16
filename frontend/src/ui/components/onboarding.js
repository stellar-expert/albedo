import React from 'react'
import PropTypes from 'prop-types'

const OnboardingSteps = [

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
            <h2>Create Account - Introduction</h2>
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
