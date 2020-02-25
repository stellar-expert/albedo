import React from 'react'
import '../components/logo.scss'

export default function () {
    return <a href="/" className="logo dimmed">
        <img src="/img/logo.svg" alt="Albedo" style={{height:'3rem'}}/>{' '}
        <i style={{fontSize: '0.8em', verticalAlign:'bottom'}}>alpha</i>
    </a>
}