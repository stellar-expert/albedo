import React, {memo, useEffect, useState} from 'react'
import {Memo} from 'stellar-sdk'
import {runInAction} from 'mobx'
import {observer} from 'mobx-react'
import {Dropdown} from '@stellar-expert/ui-framework'

const memoTypes = ['none', 'text', 'id', 'hash', 'return']

function getPlaceholder(memoType) {
    switch (memoType) {
        case 'text':
            return 'Memo text'
        case 'id':
            return 'Memo id'
        case 'return':
        case 'hash':
            return 'Memo hash (HEX encoding)'
    }
}

function TransferMemoView({transfer}) {
    const [value, setValue] = useState(''),
        [type, setType] = useState(!transfer.memo ? 'none' : transfer.memo.type)

    useEffect(() => {
        let value = transfer?.memo?.value || ''
        if (value instanceof Buffer) {
            value = value.toString('hex')
        }
        setValue(value)
        setType(transfer?.memo?.type || 'none')
    }, [transfer?.memo])

    function setMemoType(type) {
        setType(type)
        setMemo(type, value)
    }

    function setMemoValue(e) {
        const {value} = e.target
        setValue(value)
        setMemo(type, value)
    }

    function setMemo(type, value) {
        runInAction(() => {
            if (!value || type === 'none') {
                transfer.memo = null
                transfer.invalidMemo = false
            } else {
                try {
                    transfer.memo = new Memo(type, value.trim())
                    transfer.invalidMemo = false
                } catch (e) {
                    transfer.invalidMemo = true
                }
            }
        })
    }

    return <div>
        Transaction memo: <Dropdown options={memoTypes} value={type} onChange={setMemoType}/>
        <span className="dimmed"> (optional)</span>
        {type !== 'none' && <div>
            <input type="text" value={value} onChange={setMemoValue} placeholder={getPlaceholder(type)}/>
        </div>}
    </div>
}

export default observer(TransferMemoView)