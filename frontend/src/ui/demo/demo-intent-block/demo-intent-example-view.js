import React from 'react'
import {intentInterface} from '@albedo-link/intent'
import {Button, CodeBlock, CopyToClipboard, useDependantState} from '@stellar-expert/ui-framework'
import {
    generateAlbedoCode,
    generateButtonScriptCode,
    generateWebStellarLinkCode,
    getIntentTitle
} from '../demo-code-generator'
import DemoHtmlPreviewView from './demo-html-preview-view'

function generateExample(intent, allParams, selectedTab, inProgress, onExec) {
    switch (selectedTab) {
        case 'script':
            const intentDefinition = intentInterface[intent],
                {returns} = intentDefinition
            return {
                example: generateAlbedoCode(intent, allParams, returns),
                lang: 'js',
                execButton: <Button block disabled={inProgress} onClick={onExec}>Try it</Button>
            }
        case 'button':
            return {
                example: generateButtonScriptCode(intent, allParams),
                lang: 'html',
                execButton: <Button block disabled={inProgress} onClick={onExec}>Try it</Button>
            }
        case 'link':
            const linkAddress = generateWebStellarLinkCode(intent, allParams)
            return {
                example: `<a href="${linkAddress}" target="_blank">${getIntentTitle(intent)}</a>`,
                lang: 'html',
                execButton: <a href={inProgress ? '#' : linkAddress} className="button button-block"
                               disabled={inProgress} target={inProgress ? undefined : '_blank'}>Try it</a>
            }
    }
}

export default function DemoIntentExampleView({intent, allParams, selectedTab, inProgress, onExec}) {
    const {example, lang, execButton} = generateExample(intent, allParams, selectedTab, inProgress, onExec)
    const [copied, setCopied] = useDependantState(() => false, [intent, allParams, selectedTab])
    if (!example) return null

    return <div className="space">
        <div className="space">
            <DemoHtmlPreviewView script={example} selectedTab={selectedTab}/>
        </div>
        <CodeBlock lang={lang}>{example}</CodeBlock>
        <div className="space row">
            <div className="column column-50">
                {execButton}
            </div>
            <div className="column column-50">
                <CopyToClipboard text={example} icon={false}>
                    <Button block outline={copied} onClick={() => setCopied(true)}
                            onMouseEnter={() => setCopied(false)}>
                        <i className="icon-copy active-icon"/> {copied ? 'Copied to clipboard' : 'Copy to clipboard'}
                    </Button>
                </CopyToClipboard>
            </div>
        </div>
    </div>
}