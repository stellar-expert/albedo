import React, {useRef, useEffect} from 'react'
import Vivus from 'vivus'

export default function FeatureIcon({src}) {
    if (!src) return null
    const svg = useRef(null),
        animated = useRef(false)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (animated.current) return
                new Vivus(svg.current, {type: 'delayed', duration: 50, selfDestroy: true, file: src}, null)
                animated.current = true
            },
            {
                threshold: 0.2
            }
        )
        if (!svg.current) return
        observer.observe(svg.current)
        return () => {
            observer.unobserve(svg.current)
            animated.current = false
        }

    }, [])
    return <div ref={svg} className="feature-icon"/>
}