import React from 'react'
import Loadable from 'react-loadable'

function loadable(dynamicImport, render = null) {
    const options = {
        loader: dynamicImport,
        loading: ({error}) => {
            if (error) console.error(error)
            return <div className="loader"/>
        }
    }
    if (render) {
        options.render = function (loaded, props) {
            if (loaded) {
                if (loaded.__esModule) {
                    loaded = loaded.default
                }
                render(loaded, props)
            }
        }
    }
    return Loadable(options)
}

export default loadable