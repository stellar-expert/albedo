import React from 'react'
import {Button} from '@stellar-expert/ui-framework'
import {isExtensionInstalled} from '../../extension/extension-detection'
import SoloLayoutView from '../layout/solo-layout-view'

//TODO: automatically detect browser runtime
export default function InstallExtensionView() {
    return <SoloLayoutView title="Install browser extension">
        <div>
            <p>
                Albedo extension is a thin wrapper on top of albedo.link website. If you often use Albedo or other
                Stellar services that support web+stellar links, you might want to install this extension.
                It has the same functionality as the main website, plus a few bonus features.
            </p>
            <ul className="list">
                <li>
                    Review account balances and transaction history in one click.
                </li>
                <li>
                    Skip typing passwords every time to confirm the request.
                </li>
                <li>
                    All Albedo to handle all web+stellar links automatically.
                </li>
            </ul>
        </div>
        {isExtensionInstalled() && <div className="space text-small">
            <i className="icon-ok"/> Albedo extension has been already installed in this browser.
        </div>}
        <div className="double-space">
            <Button block target="_blank" href="https://chrome.google.com/webstore/detail/kbojmmmibkfijmjgnfgfpngmmgkkpncl">
                Get Chrome extension
            </Button>
            <Button block target="_blank" href="https://addons.mozilla.org/en-US/firefox/addon/albedo-signer-for-stellar/">
                Get Firefox add-on
            </Button>
        </div>
    </SoloLayoutView>
}