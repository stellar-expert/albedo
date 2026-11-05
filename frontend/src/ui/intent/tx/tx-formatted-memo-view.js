import React from 'react'
import {encodeBase64} from '../../../util/crypto/base64'

export function hasMemo(tx){
    return tx.memo && tx.memo.type !== 'none'
}

export default function TxFormattedMemo({rawMemo}) {
    switch (rawMemo && rawMemo.type) {
        case 'id':
            return <><span className="word-break">{rawMemo.value}</span> <span
                className="dimmed">(MEMO_{rawMemo.type.toUpperCase()})</span></>
        case 'text': {
            //text memos decoded from XDR are represented as raw bytes
            const text = rawMemo.value instanceof Uint8Array ? new TextDecoder().decode(rawMemo.value) : rawMemo.value
            return <><span className="word-break">{text}</span> <span
                className="dimmed">(MEMO_{rawMemo.type.toUpperCase()})</span></>
        }
        case 'hash':
        case 'return':
            return <><span className="word-break">{encodeBase64(rawMemo.value)}</span> <span
                className="dimmed">(MEMO_{rawMemo.type.toUpperCase()})</span></>
    }
    return <span className="dimmed">none</span>
}
