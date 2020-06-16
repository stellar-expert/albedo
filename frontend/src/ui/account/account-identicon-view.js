import React, {useEffect, useRef} from 'react'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import createStellarIdenticon from 'stellar-identicon-js'
import './account-identicon.scss'

function AccountIdenticonView({address, large, className}) {
    const size = large ? 20 : 14
    const canvasRef = useRef(null)
    useEffect(() => {
        if (!canvasRef.current) return
        const drawingContext = canvasRef.current.getContext('2d')
        if (address) {
            const identicon = createStellarIdenticon(address, {width: size, height: size})
            drawingContext.clearRect(0, 0, size, size)
            drawingContext.drawImage(identicon, 0, 0)
        } else {
            drawingContext.clearRect(0, 0, size, size)
        }
    }, [address])
    return <canvas ref={canvasRef} className={cn('identicon', className, {large})} width={size} height={size}/>
}

AccountIdenticonView.propTypes = {
    address: PropTypes.string.isRequired,
    className: PropTypes.string,
    large: PropTypes.bool
}

export default observer(AccountIdenticonView)
