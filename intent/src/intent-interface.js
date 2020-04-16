const intentInterface = {
    basic_info: {
        risk: 'low',
        title: 'View personal info',
        personalData: true,
        unsafe: false,
        implicitFlow: false,
        params: {},
        returns: ['info']
    },
    public_key: {
        risk: 'low',
        title: 'View public key',
        personalData: false,
        unsafe: false,
        implicitFlow: false,
        params: {
            token: {required: false}
        },
        returns: ['pubkey', 'token', 'token_signature']
    },
    sign_message: {
        risk: 'medium',
        title: 'Sign text message',
        personalData: false,
        unsafe: false,
        implicitFlow: true,
        params: {
            message: {required: true},
            pubkey: {required: false}
        },
        returns: ['pubkey', 'message', 'original_message', 'message_signature']
    },
    tx: {
        risk: 'high',
        title: 'Sign transaction',
        personalData: false,
        unsafe: true,
        implicitFlow: true,
        params: {
            xdr: {required: true},
            pubkey: {required: false},
            network: {required: false},
            horizon: {required: false},
            callback: {required: false},
            submit: {required: false, type: Boolean}
        },
        returns: ['xdr', 'signed_envelope_xdr', 'pubkey', 'tx_signature', 'network', 'submit']
    },
    pay: {
        risk: 'high',
        title: 'Make payment',
        personalData: false,
        unsafe: false,
        implicitFlow: true,
        params: {
            amount: {required: true},
            destination: {required: true},
            asset_code: {required: false},
            asset_issuer: {required: false},
            memo: {required: false},
            memo_type: {required: false},
            pubkey: {required: false},
            network: {required: false},
            horizon: {required: false},
            submit: {required: false, type: Boolean}
        },
        returns: ['amount', 'destination', 'asset_code', 'asset_issuer', 'memo', 'memo_type', 'signed_envelope_xdr', 'pubkey', 'tx_signature', 'network', 'horizon']
    },
    trust: {
        risk: 'low',
        title: 'Establish trustline',
        personalData: false,
        unsafe: false,
        implicitFlow: true,
        params: {
            asset_code: {required: true},
            asset_issuer: {required: true},
            limit: {required: false},
            pubkey: {required: false},
            network: {required: false},
            horizon: {required: false},
            submit: {required: false, type: Boolean}
        },
        returns: ['asset_code', 'asset_issuer', 'limit', 'signed_envelope_xdr', 'pubkey', 'tx_signature', 'network', 'horizon']
    },
    implicit_flow: {
        risk: 'high',
        title: 'Grant session permissions',
        personalData: false,
        unsafe: true,
        implicitFlow: false,
        params: {
            intents: {required: true}
        },
        returns: ['granted', 'intents', 'session', 'pubkey', 'valid_until']
    },
    create_keypair: {
        risk: 'low',
        title: 'Create new key pair',
        personalData: false,
        unsafe: false,
        implicitFlow: true,
        params: {
            name: {required: false}
        },
        returns: ['pubkey']
    },
    exchange: {
        risk: 'high',
        title: 'Purchase tokens',
        unsafe: true,
        implicitFlow: false,
        params: {
            sell_asset_code: {required: false},
            sell_asset_issuer: {required: false},
            buy_asset_code: {required: false},
            buy_asset_issuer: {required: false},
            amount: {required: true},
            max_price: {required: true},
            pubkey: {required: false},
            network: {required: false},
            horizon: {required: false},
            submit: {required: false, type: Boolean}
        },
        returns: ['amount', 'max_price', 'sell_asset_code', 'sell_asset_issuer', 'buy_asset_code', 'buy_asset_issuer', 'tx_signature', 'network', 'horizon']
    }
}

export default intentInterface
