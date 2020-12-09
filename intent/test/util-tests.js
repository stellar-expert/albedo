import {assert} from 'chai'
import intentLib from '../src/index'
import frontendStub from './intent-test-utils'
import {saveImplicitSession} from '../src/implicit-session-storage'

describe('utilities tests', function () {
    before(() => {
        frontendStub.setup()
    })
    after(() => {
        frontendStub.destroy()
    })

    it('generates new random token each time', function () {
        const rnd = new Set(),
            iterations = 20
        for (let i = 0; i < iterations; i++) {
            rnd.add(intentLib.generateRandomToken())
        }
        assert.equal(rnd.size, iterations, 'Non-unique value detected')
    })

    it('manages implicit sessions', function () {
        const now = new Date().getTime(),
            expiration = [now, now - 1000000, now + 100000, now + 10000000]

        function formatPubkey(ts) {
            return 'pubkey' + ts
        }

        for (let ts of expiration) {
            saveImplicitSession({
                session: intentLib.generateRandomToken(),
                pubkey: formatPubkey(ts),
                grants: 'tx,pay',
                valid_until: ts
            })
        }

        let activeSessions = intentLib.listImplicitSessions()

        assert.equal(activeSessions.length, 2, 'Invalid expiration storage rules applied')

        assert.isTrue(intentLib.isImplicitSessionAllowed('tx', formatPubkey(expiration[3])))

        assert.isFalse(intentLib.isImplicitSessionAllowed('trust', formatPubkey(expiration[3])))

        assert.isFalse(intentLib.isImplicitSessionAllowed('tx', formatPubkey(expiration[1])))

        intentLib.forgetImplicitSession(formatPubkey(expiration[3]))

        activeSessions = intentLib.listImplicitSessions()

        assert.equal(activeSessions.length, 1)

        assert.equal(activeSessions[0].pubkey, formatPubkey(expiration[2]))
    })
})