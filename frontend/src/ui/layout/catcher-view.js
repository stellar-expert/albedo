import React from 'react'
import {withRouter} from 'react-router'
import {BlockSelect} from '@stellar-expert/ui-framework'

class CatcherView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {lastError: null}
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.lastError && prevProps.location.pathname !== this.props.location.pathname) {
            this.setState({lastError: null})
        }
    }

    componentDidCatch(e, errorInfo) {
        console.error(e)
        this.setState({lastError: e})
    }

    render() {
        const {lastError} = this.state
        if (lastError) {
            const {message, stack} = lastError,
                compiledText = `Error details:
"${message}" at ${window.location.href}
${stack}
${navigator.userAgent}`

            return <div className="container">
                <h2>Unhandled error occurred</h2>
                <hr className="flare"/>
                <div className="error space text-small" style={{overflow: 'auto', maxWidth: '100%'}}>
                    <BlockSelect as="div">
                        <div className="micro-space">
                            "{message}" at {window.location.href}
                        </div>
                        <pre>{stack}</pre>
                        <div>{navigator.userAgent}</div>
                    </BlockSelect>
                </div>
                <div className="space dimmed text-small">
                    If this error persists please{' '}
                    <a href={'mailto:support@stellar.expert?subject=Albedo%20exception&body=' + encodeURIComponent(compiledText)}
                       target="_blank">contact our support</a>.
                </div>
            </div>
        }
        return this.props.children
    }
}

export default withRouter(CatcherView)