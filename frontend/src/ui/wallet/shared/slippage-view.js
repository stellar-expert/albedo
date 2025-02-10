import React from 'react'
import {Dropdown, InfoTooltip} from '@stellar-expert/ui-framework'

const slippageValues = [
    {value: '0.5', title: <span className="text-tiny">0.5%</span>},
    {value: '1', title: <span className="text-tiny">1%</span>},
    {value: '2', title: <span className="text-tiny">2%</span>},
    {value: '5', title: <span className="text-tiny">5%</span>}
]

export default function SlippageView({value, onChange}) {
    return <div className="text-tiny relative">
        Max slippage: <Dropdown options={slippageValues} onChange={onChange} value={value} title={`${value}%`}/>
        <span className="text-justify">&nbsp;<InfoTooltip>
        Controls the amount of price slippage (the maximum % of price movement) you are willing to accept
        for a trade. If the actual price slippage during the order execution exceeds this threshold, the
        trade will fail. The calculated amounts of tokens being bought include the slippage.
    </InfoTooltip></span>
    </div>
}