import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

function ActionsBlock({children, className}) {
    return <div className="actions">
        <div className={cn('space', className)}>
            {children}
        </div>
    </div>
}

ActionsBlock.propTypes = {
    children: PropTypes.any.isRequired,
    className: PropTypes.string
}

export default ActionsBlock