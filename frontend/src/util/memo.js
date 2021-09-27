import {Memo} from 'stellar-sdk'

/**
 *
 * @param {String} memo_type
 * @param {String} memo
 * @return {Memo}
 */
export function encodeMemo({memo_type, memo}) {
    if (memo === undefined) return null
    switch (memo_type) {
        case 'id':
            return Memo.id(memo)
        case 'hash':
            return Memo.hash(memo)
        case 'return':
            return Memo.return(memo)
        case 'text':
        default:
            return Memo.text(memo)
    }
}