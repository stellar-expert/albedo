import React, {useState} from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import {BlockSelect} from '@stellar-expert/ui-framework'
import {secretToMnemonic} from '../../../util/mnemonic'

export default function SecretView({secret, encodeMnemonic, placeholder, revealed = false, children}) {
    const [isRevealed, reveal] = useState(revealed)
    if (!secret) return null

    let value = '',
        style = {minHeight: (encodeMnemonic ? 5 : 2.3) + 'em', color: 'var(--color-alert)'}

    if (isRevealed) {
        value = secret
        if (encodeMnemonic) {
            value = secretToMnemonic(value)
        }
    } else {
        style.cursor = 'pointer'
    }

    function handleClick() {
        reveal(true)
    }

    return <>
        <div>{children}</div>
        <div className="input-like" style={style} placeholder={placeholder} onClick={handleClick}>
            {value ?
                <BlockSelect className={cn('text-small', {
                    'word-break': !encodeMnemonic,
                    condensed: !encodeMnemonic
                })}>{value}</BlockSelect>
                : <span className="dimmed text-small">{placeholder}</span>}
        </div>
    </>
}

SecretView.propTypes = {
    secret: PropTypes.string,
    encodeMnemonic: PropTypes.bool,
    placeholder: PropTypes.string,
    revealed: PropTypes.bool,
    children: PropTypes.any
}