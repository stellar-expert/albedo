import React from 'react'
import PropTypes from 'prop-types'
import {useDependantState} from '../../state/state-hooks'
import AccountAddressView from './account-address'
import {useStellarNetwork} from '../../state/network-selector'
import {resolveAssetMeta} from '../../util/asset-meta-resolver'
import './asset-name.scss'

function normalizeAsset(asset) {
    const {code, issuer} = asset
    if (!issuer) {
        if (code === 'XLM') return 'XLM'
        throw new TypeError(`Invalid asset: ${JSON.stringify(asset)}.`)
    }
    return code + '-' + issuer
}

function AssetName({asset}) {
    if (!asset) return null
    if (typeof asset === 'string') {
        let [code, issuer] = asset.split('-')
        asset = {code, issuer}
    }
    const currentNetwork = useStellarNetwork()
    const [tomlData, setTomlData] = useDependantState(() => {
        resolveAssetMeta(asset, currentNetwork)
            .then(data=>setTomlData(data))
        return null
    }, [asset?.code, asset?.issuer, currentNetwork])
    if (!tomlData) return null
    let issuerInfo
    if (tomlData.domain) {
        issuerInfo = <span className="dimmed">@{tomlData.domain}</span>
    } else {
        issuerInfo = asset.issuer ?
            <span className="dimmed">@<AccountAddressView account={asset.issuer} chars={8}/></span> : null
    }

    return <span className="asset-name">
        {tomlData.icon && <><img src={tomlData.icon}/> </>}
        {asset.code}{issuerInfo}
    </span>
}

AssetName.propTypes = {
    asset: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
        code: PropTypes.string,
        issuer: PropTypes.string
    })]).isRequired
}

export default AssetName