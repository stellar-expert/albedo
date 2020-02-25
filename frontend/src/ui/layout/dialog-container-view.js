import React from 'react'

function DialogContainerView({children}) {
    return <div className="row" style={{paddingTop: '3rem'}}>
        <div className="column column-60 column-offset-20">{children}</div>
    </div>
}

export default DialogContainerView