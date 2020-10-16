import React from 'react'
import {observer} from 'mobx-react'
import IntentBlock from './demo-intent-block/demo-intent-block-view'
import {intentInterface} from '@albedo-link/intent'
import demoNav from './demo-nav-model'
import DemoIntroView from './demo-intro-view'
import ExamplesView from './examples-view'
import PaymentRequest from './demo-payment-request-button-view'

const allSections = [
    'intro',
    //'showcase',
    'public_key',
    //'basic_info',
    'sign_message',
    'tx',
    'pay',
    'trust',
    'exchange',
    'implicit_flow',
    'payment-request'
]

@observer
class DemoView extends React.Component {
    constructor(props) {
        super(props)
        demoNav.section = (location.hash || '#intro').substr(1)
    }

    updateSection(section) {
        if (!section) return
        if (allSections.includes(section)) {
            demoNav.section = section
        }
    }

    renderNav() {
        return <ul>
            {allSections.map(section => {
                let title = section
                const intentContract = intentInterface[section]
                if (intentContract) {
                    title = intentContract.title
                }
                if (section === 'intro') {
                    title = 'Introduction'
                }
                if (section === 'showcase') {
                    title = 'Usage examples'
                }
                if (section === 'payment-request') {
                    title = 'Payment button generator'
                }
                return <li key={section} style={{padding: '0.3em 0'}}>
                    {section === demoNav.section ?
                        <b>{title}</b> :
                        <a href={'#' + section} onClick={e => this.updateSection(section)}>{title}</a>
                    }
                </li>
            })}
        </ul>
    }

    renderSection() {
        const {section} = demoNav
        if (section === 'intro') return <DemoIntroView/>
        if (section === 'showcase') return <ExamplesView/>
        if (section === 'payment-request') return <PaymentRequest/>
        return <IntentBlock key={section} intent={section}/>
    }

    render() {
        return <div className="row wide no-center">
            <div className="column">
                <h2>Demos & How-To</h2>
                <div className="row">
                    <div className="column column-33">
                        <div className="segment" style={{marginLeft: '-0.5em', padding: '0.5em 1em'}}>
                            {this.renderNav()}
                        </div>
                    </div>
                    <div className="column column-66">
                        {this.renderSection()}
                    </div>
                </div>
            </div>
        </div>
    }
}

export default DemoView