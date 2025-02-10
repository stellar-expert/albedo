import React, {useCallback, useState} from 'react'
import {Dropdown, InfoTooltip} from '@stellar-expert/ui-framework'

const confidenceValues = [
    {value: 'low', title: <span className="text-tiny">Low (lowest fees, low priority)</span>},
    {value: 'normal', title: <span className="text-tiny">Normal (works best in most cases)</span>},
    {value: 'high', title: <span className="text-tiny">High (high inclusion priority)</span>},
    {value: 'highest', title: <span className="text-tiny">Highest (try to overbid everyone else)</span>}
]

export default function FeeView({transfer}) {
    const [fee, setFee] = useState(transfer?.fee || 'normal')

    //change the fee using the input
    const changeFee = useCallback(v => {
        setFee(v)
        transfer.setFee(v)
    }, [transfer, setFee])

    return <div className="text-tiny relative">
        Priority: <Dropdown options={confidenceValues} onChange={changeFee} title={fee}/>&nbsp;
        <InfoTooltip>
            Reflects the maximum XLM fee amount you are willing to pay.
            Transactions with higher fees get more chances to be executed faster.
        </InfoTooltip>
    </div>
}