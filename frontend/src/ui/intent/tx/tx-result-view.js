import React, {useEffect} from 'react'
import lastActionResult from '../../../state/last-action-result'
import SoloLayoutView from '../../layout/solo-layout-view'

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
    return <SoloLayoutView title="Transaction Success">
        <div className="text-center double-space">
            <i className="icon-ok color-success"/> The transaction has been processed successfully
            {result?.result?.successful && <div className="space text-small">
                <a href={`https://stellar.expert/explorer/${result.network}/tx/${result.result.id}`} target="_blank" onClick={closeWindow}>
                    View transaction details on block explorer</a>
            </div>}
            <div className="double-space dimmed text-small">
                You can <a href="#" onClick={closeWindow}>close</a> this browser tab now.
            </div>
        </div>
    </SoloLayoutView>
}