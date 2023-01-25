import React from 'react'

export default function ActionLoaderView({message}){
    return <div className="double-space dimmed text-tiny text-center">
        <div className="loader"/>
        {message}…
    </div>
}