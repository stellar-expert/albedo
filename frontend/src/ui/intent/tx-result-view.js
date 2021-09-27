import React, {useEffect} from 'react'
import lastActionResult from '../../state/last-action-result'

function closeWindow() {
    setTimeout(() => window.close(), 200)
}

export default function TxResultView() {
    const {result} = lastActionResult
    useEffect(() => {
        return () => {
            lastActionResult.setResult(null)
        }
    })
    return <div className="text-center">
        <h2><i className="icon-ok color-success small"/> Success</h2>
        {result?.result?.successful &&
        <a href={`https://stellar.expert/explorer/${result.network}/tx/${result.result.id}`} target="_blank"
           className="small" onClick={closeWindow}>
            View transaction details on block explorer</a>
        }
        <div className="double-space dimmed small">
            You can <a href="#" onClick={closeWindow}>close</a> this browser tab now.
        </div>
    </div>
}