import {xdr, StrKey} from 'stellar-sdk'
import BigNumber from 'bignumber.js'

export const XDR_TYPE = Symbol('XDR_TYPE')

/**
 * Convert XDR-encoded value to plain object representation
 * @param {String|{}} xdrValue - Base64-encoded xdr
 * @param {String} type? - XDR
 * @return {{}|{}[]}
 */
export function convertXdrToObject(xdrValue, type) {
    if (typeof xdrValue !== 'string')
        return convertNode(xdrValue)

    try {
        const xdrObject = xdr[type].fromXDR(xdrValue, 'base64')
        return convertNode(xdrObject, type)
    } catch (error) {
        throw new Error('Invalid XDR format for contract ' + type)
    }
}

function convertNode(object, type) {
    if (object instanceof Array)
        return object.map(v => convertNode(v))

    if (isAtomic(object))
        return convertAtomicValue(object, type)

    if (object.switch)
        return convertArm(object, type)

    return convertObject(object, type)
}

function convertArm(object, type) {
    const arm = object.arm()
    return {
        [XDR_TYPE]: type,
        [arm]: typeof arm === 'string' ?
            convertNode(object, arm) :
            '[' + object.switch().name + ']'
    }
}

function convertObject(object, type) {
    if (!object) return undefined
    const methods = Object.keys(object).filter(key => typeof object[key] === 'function' && key !== 'toXDR')
    const res = {[XDR_TYPE]: type}
    for (let method of methods) {
        res[method] = convertNode(object[method](), method)
    }
    return res
}

const predefinedKeys = {
    amount: ['amount', 'startingBalance', 'sendMax', 'sendAmount', 'destMin', 'destAmount', 'limit'],
    asset: ['assetCode4', 'assetCode12', 'assetCode'],
    pubkey: ['ed25519', 'sourceAccountEd25519'],
    hint: ['hint']
}

function convertAtomicValue(object, key) {
    if (predefinedKeys.amount.includes(key)) {
        return new BigNumber(object)
    }

    if (predefinedKeys.hint.includes(key))
        return object

    if (predefinedKeys.pubkey.includes(key))
        return StrKey.encodeEd25519PublicKey(object)

    if (predefinedKeys.asset.includes(key))
        return object.toString()

    if (typeof object === 'undefined')
        return

    if (object._isBuffer)
        return new Buffer(object).toString('base64')

    if (typeof object.toString === 'function')
        return object.toString()

    throw new Error('Unsupported XDR parsing clause')
}

function isAtomic(node) {
    if (!node)
        return true
    if (typeof node === 'string')
        return true
    if (node._isBuffer)
        return true
    if (!Object.keys(node).filter(key => typeof node[key] === 'function').length)
        return true
    if (node.getLowBits && node.getHighBits)
        return true
    return false
}
