import {Address, Contract, TransactionBuilder, StrKey, scValToNative, XdrLargeInt} from '@stellar/stellar-base'
import {rpc} from '@stellar/stellar-sdk'
import {AssetDescriptor} from '@stellar-expert/asset-descriptor'
import {resolveNetworkParams} from './network-resolver'

/**
 * Get SAC contract address for a given asset
 * @param {string|Asset|{}} asset
 * @param {string} network
 * @return {string}
 */
export function getSacContractAddress(asset, network) {
    if (typeof asset === 'string' && StrKey.isValidContract(asset))
        return asset //imply that the argument is already a contract address
    return AssetDescriptor.parse(asset).toAsset().contractId(resolveNetworkParams({network}).network)
}

/**
 * Simulate Soroban tx
 * @param {Transaction} tx - Transaction to simulate
 * @param {rpc.Server} server - RPC server
 * @return {Promise}
 */
export async function simulateTx(tx, server) {
    const res = await server.simulateTransaction(tx)
    if (res.result === undefined)
        throw new Error('Simulation failed')
    return res
}

/**
 * Retrieve contract token balance for a given account
 * @param {string} contractId - Token contract address
 * @param {string} address - Account or contract address
 * @param {string} network - Network identifier
 * @return {Promise<bigint>}
 */
export async function getTokenBalance(contractId, address, network) {
    return await simulateTokenReadCall(contractId, network, 'balance', [Address.fromString(address).toScVal()])
}

/**
 * Retrieve contract token decimals
 * @param {string} contractId - Token contract address
 * @param {string} network - Network identifier
 * @return {Promise<number>}
 */
export async function getTokenDecimals(contractId, network) {
    return await simulateTokenReadCall(contractId, network, 'decimals')
}

/**
 * Retrieve contract token symbol
 * @param {string} contractId - Token contract address
 * @param {string} network - Network identifier
 * @return {Promise<string>}
 */
export async function getTokenSymbol(contractId, network) {
    return await simulateTokenReadCall(contractId, network, 'symbol')
}

/**
 *
 * @param {string} asset
 * @param  source
 * @param destination
 * @param amount
 * @param network
 * @return {Promise<void>}
 */
export async function transferToken(asset, source, destination, amount, network) {
    const contractArgs = [ //standard transfer args - from, to, amount
        new Address(transfer.source).toScVal(),
        new Address(transfer.destination).toScVal(),
        new XdrLargeInt('i128', transfer.amount[0]).toI128()
    ]
    const contractId = getSacContractAddress(transfer.asset[0], transfer.network)
    const contract = new Contract(contractId)
    builder.addOperation(contract.call('transfer', ...contractArgs))
}

async function simulateTokenReadCall(contractId, network, method, args = []) {
    const contract = new Contract(contractId)
    const builder = new TransactionBuilder(fakeAccount, {
            fee: '1000',
            networkPassphrase: resolveNetworkParams({network}).network
        }
    )
    const tx = builder
        .addOperation(contract.call(method, ...args))
        .setTimeout(0)
        .build()
    const res = await simulateTx(tx, resolveNetworkParams({network}).createRpc())
    return scValToNative(res.result.retval)
}

const fakeAccount = {
    accountId() {
        return 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'
    },
    sequenceNumber() {
        return '1'
    },
    incrementSequenceNumber() {

    }
}