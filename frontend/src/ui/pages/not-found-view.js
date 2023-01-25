import React from 'react'
import PropTypes from 'prop-types'

function NotFoundPage({location}) {
    return <>
        <div className="row double-space">
            <div className="column column-offset-33 column-33">
                <div className="text-center">
                    <h1 style={{lineHeight: 1}}>
                        404
                        <br/>
                        Page not found
                    </h1>
                    <div className="space">
                        You tried to access <code>{location.pathname}</code><br/>
                        Unfortunately it's not here.
                    </div>
                    <div className="space">
                        <a href="/">Get back to home page</a>
                    </div>
                </div>
            </div>
        </div>
    </>
}

NotFoundPage.propTypes = {
    location: PropTypes.object.isRequired
}

export default NotFoundPage
