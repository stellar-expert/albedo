import React from 'react'
import PropTypes from 'prop-types'
import {formatAssetUnifiedLink} from '../../util/formatter'
import AccountAddressView from './account-address'
import appSetting from '../../state/app-settings'

function normalizeAsset(asset) {
    const {code, issuer} = asset
    if (!issuer) {
        if (code === 'XLM') return 'XLM'
        throw new TypeError(`Invalid asset: ${JSON.stringify(asset)}.`)
    }
    return code + '-' + issuer
}

function AssetLink({asset, displayIssuer}) {
    if (!asset) return null
    if (typeof asset === 'string') {
        let [code, issuer] = asset.split('-')
        asset = {code, issuer}
    }
    return <span>
        {asset.code}
        {displayIssuer && asset.issuer && <>-<AccountAddressView account={asset.issuer} chars={8}/></>}
    </span>
}

AssetLink.propTypes = {
    asset: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
        code: PropTypes.string,
        issuer: PropTypes.string
    })]).isRequired,
    link: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    displayIssuer: PropTypes.bool
}

export default AssetLink