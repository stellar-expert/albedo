import React, {Component} from 'react'

class ButtonGenerator extends Component {
    constructor() {
        super()
        this.buttonContainer = React.createRef()
        this.handleChange = this.handleChange.bind(this)
        this.state = {
            values: {
                height: '50',
                width: '200',
                text: 'Donate',
                amount: '1',
                destination: 'GABTCABWAGRBDAF3WL5ABWOYIROSVWBMK46K64NKT23XS2YIQ4NLQRX3'
            },
            scriptTemplate: `<script src="https://localhost:9001/distr/button.js" button-width="#{width}" button-height="#{height}" button-text="#{text}" intent-amount="#{amount}" intent-destination="#{destination}"></script>`,
            script: ''
        }
    }

    componentDidMount() {
        this.insertScript(this.state.values, this.state.scriptTemplate)
    }

    handleChange(event) {
        const state = this.state
        state.script = this.evaluateScript(state.values, state.scriptTemplate)
        this.setState({
            values: {
                [event.target.name]: event.target.value,
                script: state.script
            }
        })
    }

    evaluateScript(values, template) {
        let script = template
        Object.keys(values).forEach((v) => {
            script = script.replace(`#{${v}}`, values[v])
        })
        return script
    }

    insertScript(values, script) {
        let evaluatedScript = this.evaluateScript(values, script)
        this.setState({
            script: evaluatedScript
        })
        const range = document.createRange()
        range.setStart(this.buttonContainer.current, 0)
        this.buttonContainer.current.appendChild(range.createContextualFragment(evaluatedScript))
    }

    render() {
        return <div>
            Height: <input name="height" type="text" value={this.state.values.height} onChange={this.handleChange}/>
            Width: <input name="width" type="text" value={this.state.values.width} onChange={this.handleChange}/>
            Text: <input name="text" type="text" value={this.state.values.text} onChange={this.handleChange}/>
            Amount: <input name="amount" type="number" value={this.state.values.amount} onChange={this.handleChange}/>
            Destination: <input name="destination" type="text" value={this.state.values.destination}
                                onChange={this.handleChange}/>
            <div ref={this.buttonContainer}></div>
            <textarea rows={20} readOnly value={this.state.script} style={{height: '400px'}}></textarea>
        </div>
    }
}

export default ButtonGenerator
