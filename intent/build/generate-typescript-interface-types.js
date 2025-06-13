import {intentInterface} from '../src/index.js'

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function generateName(intentName, suffix) {
    const parts = intentName.split('_').map(capitalize)
    return parts.join('') + suffix
}

function generateParamsInterface(intent) {
    const requestParams = Object.entries(intentInterface[intent].params)
        .map(([key, {description, type, required}]) => `
    /**
    * ${description}
    */
    ${key}${required === false ? '?' : ''}: ${type}`)

    return `
export interface ${generateName(intent, 'IntentParams')} {${requestParams.join(',')}
}
`
}

function generateResultInterface(intent) {
    const requestParams = Object.entries(intentInterface[intent].returns)
        .map(([key, {description, type}]) => `
    /**
    * ${description}
    */
    ${key}: ${type}`)

    return `
export interface ${generateName(intent, 'IntentResult')} {${requestParams.join(',')}
}
`
}

function generateAlbedoInterface() {
    const methods = Object.keys(intentInterface)
        .map(intent => {
            const methodName = intent.split('_')
                .map((part, i) => i === 0 ? part : capitalize(part))
                .join('')
            const {description} = intentInterface[intent]
            return `
    /**
     * ${description}
     */
    ${methodName}: (params: ${generateName(intent, 'IntentParams')}) => Promise<${generateName(intent, 'IntentResult')}>`
        })
    return `/**
 * Albedo API external interface implementation.
 */
export interface AlbedoIntent {${methods.join(',')},
    /**
    * Check whether an implicit session exists for a given intent and pubkey.
    */
    isImplicitSessionAllowed: (intent: string, pubkey: string) => boolean,
    /**
    * Enumerate all currently active implicit sessions.
    */
    listImplicitSessions: () => AlbedoImplicitSessionDescriptor[]
    /**
    * Revoke session permission granted for an account.
    */
    forgetImplicitSession: (pubkey: string) => void,
    /**
    * Generate a random string of characters that can be used as an authorization challenge token.
    */
    generateRandomToken: () => string
}`
}

export function generateTypescriptInterface() {
    return `${generateAlbedoInterface()}

${Object.keys(intentInterface).map(intent => generateParamsInterface(intent) + generateResultInterface(intent)).join('')}
export type StellarNetwork = 'public' | 'testnet'

declare const albedo: AlbedoIntent

export default albedo

export interface AlbedoImplicitSessionDescriptor {
    pubkey: string,
    session: string,
    valid_until: number,
    grants: string[]
}

export interface AlbedoIntentInterfaceParamDescriptor {
    description: string,
    required: boolean,
    type?: any
}

export interface AlbedoIntentInterfaceDescriptor {
    risk: 'low' | 'medium' | 'high',
    title: string,
    description: string,
    unsafe: boolean,
    implicitFlow: boolean,
    params: Record<string, AlbedoIntentInterfaceParamDescriptor>,
    returns: string[]
}

export const intentInterface: Record<string, AlbedoIntentInterfaceDescriptor>

export interface AlbedoIntentErrorDescriptor {
    message: string,
    code: number
}

export const intentErrors: Record<string, AlbedoIntentErrorDescriptor>
`
}