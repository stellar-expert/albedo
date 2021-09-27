import React, {memo, useState} from 'react'
import {Memo} from 'stellar-sdk'
import {observer} from 'mobx-react'
import {Dropdown} from '@stellar-expert/ui-framework'
import {runInAction} from 'mobx'

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
        [type, setType] = useState(!transfer.memo ? 'none' : transfer.memo.type),
        [invalid, setInvalid] = useState(false)

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
            setInvalid(false)
            if (!value || type === 'none') {
                transfer.memo = null
            } else {
                try {
                    transfer.memo = new Memo(type, value.trim())
                } catch (e) {
                    setInvalid(true)
                }
            }
        })
    }


    return <div>
        Transaction memo: <Dropdown options={memoTypes} value={type} onChange={setMemoType}/>
        <span className="dimmed"> (optional)</span>
        {type !== 'none' && <div>
            <input type="text" value={value} onChange={setMemoValue} placeholder={getPlaceholder(type)}/>
            {!!invalid && <div className="warning text-small micro-space">
                <i className="icon-warning"/> Invalid memo format. Please check the value.
            </div>}
        </div>}
    </div>
}

export default observer(TransferMemoView)