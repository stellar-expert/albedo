import React from 'react'
import PropTypes from 'prop-types'
import AssetName from './asset-name'
import {formatCurrency} from '../../util/formatter'

const Amount = ({amount, asset, decimals, round}) => {
    if (amount === undefined || amount === null) return null
    if (round) {
        amount = Math.round(amount)
    }
    return <span className="amount nowrap">
        {formatCurrency(amount, decimals)} {!!asset && <AssetName asset={asset}/>}
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
    link: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
}

export default Amount