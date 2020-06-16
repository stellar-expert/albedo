import React from 'react'
import {setStellarNetwork, useStellarNetwork} from '../../state/network-selector'
import Dropdown from '../components/dropdown'

export default function NetworkSelectorView() {
    const network = useStellarNetwork()

    return <>
        Network:{' '}
        <Dropdown options={['public', 'testnet']} onChange={network => setStellarNetwork(network)} value={network}/>
    </>
}