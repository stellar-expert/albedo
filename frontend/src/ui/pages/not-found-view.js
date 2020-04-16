import React from 'react'
import PropTypes from 'prop-types'

function NotFoundPage({location}) {
    return <>
        <div className="row">
            <div className="column column-offset-33 column-33 text-center">
                <div>
                    <h1 style={{lineHeight: 1}}>
                        404
                        <br/>
                        Page not found
                    </h1>
                    <p>
                        You tried to access <b>{location.pathname}</b>.<br/>
                        Unfortunately it's not here.
                    </p>
                    <p>
                        <a href="/">Get back to home page</a>
                    </p>
                </div>
            </div>
        </div>
    </>
}

NotFoundPage.propTypes = {
    location: PropTypes.object.isRequired
}

export default NotFoundPage
