import React from 'react'
import PropTypes from 'prop-types'
import './dialog-container.scss'

function DialogView({dialogOpen, children}) {
    if (!dialogOpen) return null
    return <div className="dialog">
        <div className="dialog-backdrop"/>
        <div className="dialog-content container">
            <div className="container">
                {children}
            </div>
        </div>
    </div>
}

DialogView.propTypes = {children: PropTypes.any}

export default DialogView