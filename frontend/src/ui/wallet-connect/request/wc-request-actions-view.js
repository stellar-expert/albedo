import React, {useState} from 'react'
import cn from 'classnames'
import {observer} from 'mobx-react'
import {Button} from '@stellar-expert/ui-framework'
import wcAdapter from '../wallet-connect-adapter'

export default observer(function WcRequestActionsView({request, nextUrl, className}) {
    const [processing, setProcessing] = useState(false)

    function approve() {
        setProcessing(true)
        wcAdapter.approveWcRequest(request, nextUrl)
            .then(() => setProcessing(false))
    }

    return <div className={cn('row', className)}>
        <div className="column column-20">
            {!!processing && <div className="loader" style={{margin: '0.1em auto'}}/>}
        </div>
        <div className="column column-40">
            <Button block onClick={approve} disabled={processing}>Approve</Button>
        </div>
        <div className="column column-40">
            <Button block outline disabled={processing} onClick={() => wcAdapter.rejectWcRequest(request, nextUrl)}>Reject</Button>
        </div>
    </div>
})