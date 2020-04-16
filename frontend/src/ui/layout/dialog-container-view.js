import React from 'react'
import PropTypes from 'prop-types'

function DialogContainerView({children}) {
    return <div className="row">
        <div className="column column-60 column-offset-20">{children}</div>
    </div>
}

DialogContainerView.propTypes = {children: PropTypes.any}

export default DialogContainerView