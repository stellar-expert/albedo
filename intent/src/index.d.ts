export interface AlbedoIntent {
    frontendUrl: string,
    request: (intent: string, params: object) => Promise<object>,
    implicitFlow: (params: object) => Promise<object>,
    publicKey: (params: object) => Promise<object>,
    tx: (params: object) => Promise<object>,
    pay: (params: object) => Promise<object>,
    trust: (params: object) => Promise<object>,
    exchange: (params: object) => Promise<object>,
    signMessage: (params: object) => Promise<object>,
    generateRandomToken: () => string,
    isImplicitSessionAllowed: (intent: string, pubkey: string) => boolean
}

declare const albedo: AlbedoIntent

export default albedo

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