import {encryptDataAes, decryptDataAes} from '../../src/util/cryptography/account-cypher'

describe('accountCypher', function () {
    it('fails to encrypt/decrypt with invalid arguments', function () {
        expect(() => encryptDataAes('', 'password')).to.throw(/Invalid argument/)
        expect(() => encryptDataAes('data', null)).to.throw(/Invalid argument/)
        expect(() => decryptDataAes('', 'password')).to.throw(/Invalid argument/)
        expect(() => decryptDataAes('data', null)).to.throw(/Invalid argument/)
    })

    it('encrypts and decrypts data', function () {
        let password = 'password' + Math.random(),
            data = new Date().toJSON(),
            encrypted = encryptDataAes(data, password)
        expect(encrypted).to.have.lengthOf.above(10)
        expect(encrypted).to.not.equal(data)
        expect(decryptDataAes(encrypted, password)).to.be.equal(data)
    })
})