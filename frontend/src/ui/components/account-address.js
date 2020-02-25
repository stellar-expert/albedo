import React from 'react'
import PropTypes from 'prop-types'
import appSettings from '../../app-settings'
import './account-address.scss'

const defaultStyle = {
    maxWidth: '100%'
}

function AccountAddress({account, chars = 12, name, link, style, className}) {
    if (!account) return null

    let innerStyle = style ? undefined : Object.assign({}, defaultStyle, style),
        address = account,
        children = []

    if (chars) {
        let limit = Math.floor(chars / 2)
        address = account.substr(0, limit) + '…' + account.substr(-limit)
    }
    children.push(<span key="address">{address}</span>)

    if (name !== false) {
        let displayName = null
        if (typeof displayName === 'string') {
            displayName = name
        }
        if (displayName) {
            children.unshift(`[${displayName}] `)
        }
    }
    let containerProps = {
            title: account,
            className: 'account-address' + (className ? ' ' + className : ''),
            style: innerStyle
        },
        tag = 'span'

    if (typeof link === 'string') {
        tag = 'a'
        containerProps.href = link
        //containerProps.target = '_blank'
    }

    return React.createElement(tag, containerProps, children)
}

AccountAddress.propTypes = {
    /**
     * Account address.
     */
    account: PropTypes.string.isRequired,
    /**
     * Explicit account name.
     */
    name: PropTypes.string,
    /**
     * Explicit link. If false, teh component is rendered without link.
     */
    link: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    /**
     * Visible address characters.
     */
    chars: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object
}

export default AccountAddress