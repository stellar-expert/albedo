import React from 'react'
import FeatureIcon from '../components/feature-icon'

export default function Feature({title, children, img}) {
    return <div className="info-block">
        <div>
            <FeatureIcon src={img}/>
            <h2>{title}</h2>
            <div className="space">{children}</div>
        </div>
    </div>
}