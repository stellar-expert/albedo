import React from 'react'
import {useLocation} from 'react-router'
import {isInsideFrame} from '../../util/frame-utils'

export default function OpenNewWindowView() {
    useLocation()
    if (!isInsideFrame())
        return null
    return <a href={location.href} target="_blank" title="Open this page in browser window" className="text-small"
              style={{position: 'fixed', zIndex: 1, right: '1px', top: '1px'}}>
        <i className="icon-open-new-window"/>
    </a>
}