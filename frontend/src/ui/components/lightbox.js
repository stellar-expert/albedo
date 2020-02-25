import React from 'react'
import PropTypes from 'prop-types'
import './lightbox.scss'
import cn from 'classnames'

function Lightbox({children, className, ...otherProps}) {
    return <div className="lightbox container">
        <div className={cn('lightbox-inner', className)} {...otherProps}>
            {children}
        </div>
    </div>
}

Lightbox.propTypes = {
    children: PropTypes.any.isRequired,
    className: PropTypes.string
}

export default Lightbox