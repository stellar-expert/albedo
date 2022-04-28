import React from 'react'

export function hasMemo(tx){
    return tx.memo && tx.memo._type !== 'none'
}

export default function TxFormattedMemo({rawMemo}) {
    switch (rawMemo && rawMemo._type) {
        case 'id':
        case 'text':
            return <><span className="word-break">{rawMemo._value.toString()}</span> <span
                className="dimmed">(MEMO_{rawMemo._type.toUpperCase()})</span></>
        case 'hash':
        case 'return':
            return <><span className="word-break">{rawMemo._value.toString('base64')}</span> <span
                className="dimmed">(MEMO_{rawMemo._type.toUpperCase()})</span></>
    }
    return <span className="dimmed">none</span>
}