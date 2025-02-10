import React from 'react'

export default function WalletPageActionDescription({children}) {
    return <div className="action-description dimmed condensed text-tiny text-right">
        / {children}
    </div>
}