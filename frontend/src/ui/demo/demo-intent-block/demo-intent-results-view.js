import React from 'react'
import cn from 'classnames'
import Highlight from '../../components/highlight'

export default function DemoIntentResultsView({result, error}) {
    if (!result) return null
    return <Highlight className={cn('result', {error})} lang="json">{result}</Highlight>
}