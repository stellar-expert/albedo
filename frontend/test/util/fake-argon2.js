import argon2 from 'argon2-browser'
import {hash} from '@stellar/stellar-sdk'

jest.mock('argon2-browser')

function setupFakeArgon2() {
    argon2.hash.mockImplementation(({pass, salt}) => {
        const simpleHash = hash(salt + pass)
        return Promise.resolve({hash: simpleHash})
    })
}

export {setupFakeArgon2}