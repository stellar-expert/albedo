import React from 'react'
import {isExtensionInstalled} from '../../extension/extension-detection'

//TODO: automatically detect browser runtime
export default function InstallExtensionView() {
    return <div>
        <h2>Install browser extension</h2>
        <div className="space">
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
        {isExtensionInstalled() && <div className="dimmed space text-small">
            <i className="fa fa-info-circle"/> Albedo extension has been already installed in this browser.
        </div>}
        <div className="double-space">
            <a href="https://chrome.google.com/webstore/detail/kbojmmmibkfijmjgnfgfpngmmgkkpncl"
               className="button button-block" target="_blank">
                <i className="fa fa-chrome"/> Get Chrome extension
            </a>
            <a href="https://addons.mozilla.org/en-US/firefox/addon/albedo-signer-for-stellar/"
               className="button button-block" target="_blank">
                <i className="fa fa-firefox"/> Get Firefox add-on
            </a>
        </div>
    </div>
}