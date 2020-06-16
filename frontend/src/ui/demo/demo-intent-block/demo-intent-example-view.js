import React from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import Highlight from '../../components/highlight'

export default function DemoIntentExampleView({returns, invocation}) {
    const formattedOutput = returns.map(returnParam => 'res.' + returnParam).join(', ')

    const example = `${invocation}
    .then(res => console.log(${formattedOutput}))`

    return <div className="space">
        <hr/>
        <b>Code</b> <CopyToClipboard text={example}>
        <a href="#" className="fa fa-copy active-icon" title="Copy script to clipboard"/>
    </CopyToClipboard>
        <Highlight>{example}</Highlight>
    </div>
}