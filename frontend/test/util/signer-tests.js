import {derivePublicKeyFromPassword, signMessage, verifyMessage} from '../../src/util/cryptography/signer'

describe('signer.getPublicKey', function () {
    it('fails to derive a public key for an empty password', function () {
        expect(() => derivePublicKeyFromPassword('')).to.throw(/Invalid password format/)
    })

    it('derives a public key for a given password', function () {
        let a = derivePublicKeyFromPassword('a1234567890'),
            b = derivePublicKeyFromPassword('a1234567891')
        expect(derivePublicKeyFromPassword('a1234567890')).to.equal(a)
        expect(derivePublicKeyFromPassword('a1234567891')).to.equal(b)
        expect(a).to.not.equal(b)
    })
})
