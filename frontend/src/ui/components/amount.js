import React from 'react'
import PropTypes from 'prop-types'
import AssetLink from './asset-link'
import {formatCurrency} from '../../util/formatter'

const Amount = ({amount, asset, decimals, adjust, round, displayIssuer}) => {
    if (amount === undefined || amount === null) return null
    if (adjust === true) {
        amount = amount / 10000000
    }
    if (round) {
        amount = Math.round(amount)
    }
    return <span className="amount nowrap">
        {formatCurrency(amount, decimals)} {!!asset && <AssetLink asset={asset} displayIssuer={displayIssuer}/>}
    </span>
}

Amount.propTypes = {
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    asset: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
        code: PropTypes.string,
        issuer: PropTypes.string
    })]),
    adjust: PropTypes.bool,
    round: PropTypes.bool,
    decimals: PropTypes.number,
    link: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    displayIssuer: PropTypes.bool
}

export default Amount