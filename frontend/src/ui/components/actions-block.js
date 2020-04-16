import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'

function ActionsBlock({children, className}) {
    return <div className={cn('actions', className)}>
        {children}
    </div>
}

ActionsBlock.propTypes = {
    children: PropTypes.any.isRequired,
    className: PropTypes.string
}

export default ActionsBlock