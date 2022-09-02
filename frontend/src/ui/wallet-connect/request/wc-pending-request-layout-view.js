import React from 'react'

export default function WcPendingRequestLayoutView({request, children}) {
    if (typeof request === 'string')
        return <div className="space">
            <i className="icon-warning color-danger"/>
            <br/>
            <div className="color-danger">
                Error. {request}
            </div>
        </div>
    const {meta} = request
    return <div className="row space">
        <div className="column column-20 text-center">
            <div style={{padding: '0.3em'}}>
                <a href={meta.link} rel="noreferrer nofollow" target="_blank">
                    <img src={meta.icon} style={{maxWidth: '100%'}} rel="noreferrer"/>
                    <div className="text-tiny">
                        {meta.name}
                    </div>
                </a>
            </div>
        </div>
        <div className="column column-80 text-small">
            {children}
        </div>
    </div>
}