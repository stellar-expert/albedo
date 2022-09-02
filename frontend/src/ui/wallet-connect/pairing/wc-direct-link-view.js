import React from 'react'
import {useAutoFocusRef} from '@stellar-expert/ui-framework'

export default function WcDirectLinkView({onChange}) {
    function change(value) {
        if (value) {
            onChange({parsed: value})
        }
    }

    function keyDown(e) {
        if (e.key === 'Enter') {
            const {value} = e.target
            change(value.trim())
        }
    }

    return <div>
        <textarea style={{width: '100%', height: '10em', resize: 'none'}} placeholder="Link code from the dapp"
                  onKeyDown={keyDown} onPaste={e => change(e.clipboardData.getData('Text'))} ref={useAutoFocusRef}/>
        <p className="text-small text-center dimmed">
            Copy-paste WalletConnect link code here
            <br/>
            (it can often be found under the QR code)</p>
    </div>
}