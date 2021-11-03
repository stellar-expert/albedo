import React from 'react'
import {Dropdown, setStellarNetwork, useStellarNetwork} from '@stellar-expert/ui-framework'

export default function NetworkSelectorView() {
    const network = useStellarNetwork()
    return <>
        <span className="dimmed"><i className="icon-link"/>network: </span>
        <Dropdown options={['public', 'testnet']} onChange={network => setStellarNetwork(network)} value={network}/>
    </>
}