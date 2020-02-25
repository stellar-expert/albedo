import argon2 from 'argon2-browser'
import shajs from 'sha.js'

jest.mock('argon2-browser')

function setupFakeArgon2() {
    argon2.hash.mockImplementation(({pass, salt}) => {
        const simpleHash = shajs('sha256').update(salt + pass).digest()
        return Promise.resolve({hash: simpleHash})
        //return Promise.resolve(simpleHash.toString('base64'))
    })
}

export {setupFakeArgon2}