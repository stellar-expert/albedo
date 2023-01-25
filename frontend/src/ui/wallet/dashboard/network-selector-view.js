import React from 'react'
import {Dropdown, setStellarNetwork, useStellarNetwork} from '@stellar-expert/ui-framework'

const options = [
    {value: 'public', title: 'public network'},
    {value: 'testnet', title: 'test network'}
]

export default function NetworkSelectorView({readOnly = false}) {
    const network = useStellarNetwork()
    return readOnly ?
        <>{network}</> :
        <Dropdown options={options} onChange={network => setStellarNetwork(network)} value={network} />
}