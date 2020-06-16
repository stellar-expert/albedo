import React from 'react'
import PropTypes from 'prop-types'
import {useStellarNetwork} from '../../state/network-selector'

/**
 *
 * @param {'public'|'testnet'} network - Network id.
 * @param {'account'|'tx'|'op'} type - Link type
 * @param {String|Array} path - Additional path arguments
 * @return {string}
 */
export function formatExplorerLink(network, type, path) {
    return `https://stellar.expert/explorer/${network}/${type}/${path}`
}

/**
 * External explorer link.
 * @param {'account'|'tx'|'op'} type - Link type
 * @param {String|Array} path - Additional path arguments
 * @param children - Link caption
 */
function ExplorerLink({type, path, children}) {
    const network = useStellarNetwork()
    if (path instanceof Array) {
        path = (args || []).join('/')
    }
    return <a href={formatExplorerLink(network, type, path)} target="_blank">{children}</a>
}

ExplorerLink.propTypes = {
    type: PropTypes.oneOf(['account', 'tx', 'op']).isRequired,
    path: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    children: PropTypes.any
}

export default ExplorerLink