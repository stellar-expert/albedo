import clone from 'clone'
import {Account, Keypair} from 'stellar-sdk'

const defaultContext = {
    selectedAccount: {
        email: 'test@test.org',
        avatar: 'none'
    },
    selectedKeypair: {
        address: 'GDUPSWMNKRF7ERDYAF2VVP2T5BQPJWTLPRWBP3KFO264GDBOILC2XZ6K',
        secret: 'SAWR7UAO7SFBF2CLGMRLF3KRLG36HEFZHEE4G3NFJ7WRSWBIYHXWJDMQ'
    },
    confirmed: true
}

class FakeActionContextBuilder {
    constructor() {
        this.props = clone(defaultContext)
    }

    notConfirmed() {
        this.props.confirmed = false
        return this
    }

    withoutSelectedAccount() {
        this.props.selectedAccount = undefined
        return this
    }

    withoutSelectedKeypair() {
        this.props.selectedAccount = undefined
        return this
    }

    fromData({intent, ...data}) {
        Object.assign(this.props, {intent, data})
        return this
    }

    build() {
        return clone(this.props)
    }
}

function buildContext(data) {
    return new FakeActionContextBuilder().fromData(data).build()
}

function loadAccount(sequence = '1', address = null) {
    return new Account(address || defaultContext.selectedKeypair.publicKey, sequence || Math.floor(Math.random() * 100000000).toString())
}

function loadKeypair(secret = null) {
    return Keypair.fromSecret(secret || defaultContext.selectedKeypair.secret)
}


export {FakeActionContextBuilder, buildContext, loadAccount, loadKeypair}