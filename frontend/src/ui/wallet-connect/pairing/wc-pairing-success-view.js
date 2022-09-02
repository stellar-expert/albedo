import React from 'react'

export default function WcPairingSuccessView() {
    return <>
        <h2>Connected</h2>
        <div className="double-space text-center">
            <div className="icon icon-ok color-success" style={{fontSize: '2em'}}/>
            <div className="space">
                <h3>Account linked</h3>
                <div className="dimmed text-small">
                    via WalletConnect
                    <div className="space">
                        You can switch back to the application now
                        <br/>
                        or <a href="/account">return to your account</a>
                    </div>
                </div>
            </div>
        </div>
    </>
}