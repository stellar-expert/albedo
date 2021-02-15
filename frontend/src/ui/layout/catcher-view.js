import React from 'react'
import {withRouter} from 'react-router'
import BlockSelect from '../components/block-select'

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
            const {message, stack} = lastError
            return <div className="container">
                <h2>Unhandled error occurred</h2>
                <hr/>
                <BlockSelect>
                    <div className="error space" style={{overflow: 'auto'}}>
                        <div className="text-small micro-space">
                            "{message}" at {window.location.href}
                        </div>
                        <pre className="text-small">{stack}</pre>
                    </div>
                </BlockSelect>
                <div className="space dimmed text-small">
                    If this error persists please{' '}
                    <a href="https://github.com/stellar-expert/albedo/issues/" target="_blank">contact
                        our support</a>.
                </div>
            </div>
        }
        return this.props.children
    }
}

export default withRouter(CatcherView)