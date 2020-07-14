import {useEffect, useState} from 'react'

export function useOnScreen(ref, rootMargin, threshold) {
    const [isIntersecting, setIntersecting] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIntersecting(entry.isIntersecting)
            },
            {
                rootMargin
            }
        )
        if (!ref.current) return
        observer.observe(ref.current)
        return () => {
            observer.unobserve(ref.current)
        }
    }, [])

    return isIntersecting
}