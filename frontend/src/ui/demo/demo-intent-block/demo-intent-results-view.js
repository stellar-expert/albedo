import React from 'react'
import cn from 'classnames'
import {CodeBlock} from '@stellar-expert/ui-framework'

export default function DemoIntentResultsView({result, error}) {
    if (!result) return null
    return <CodeBlock className={cn('result', {error})} lang="json">{result}</CodeBlock>
}