import intentLib from '../src/index.js'
import {saveImplicitSession} from '../src/implicit-session-storage.js'
import frontendStub from './intent-test-utils.js'

describe('utilities tests', function () {
    beforeAll(() => {
        frontendStub.setup()
    })
    afterAll(() => {
        frontendStub.destroy()
    })

    it('generates new random token each time', function () {
        const rnd = new Set(),
            iterations = 20
        for (let i = 0; i < iterations; i++) {
            rnd.add(intentLib.generateRandomToken())
        }
        expect(iterations, 'Non-unique value detected').toEqual(rnd.size)
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

        expect(activeSessions.length, 'Invalid expiration storage rules applied').toEqual(2)

        expect(intentLib.isImplicitSessionAllowed('tx', formatPubkey(expiration[3]))).toBeTruthy()

        expect(intentLib.isImplicitSessionAllowed('trust', formatPubkey(expiration[3]))).toBeFalsy()

        expect(intentLib.isImplicitSessionAllowed('tx', formatPubkey(expiration[1]))).toBeFalsy()

        intentLib.forgetImplicitSession(formatPubkey(expiration[3]))

        activeSessions = intentLib.listImplicitSessions()

        expect(activeSessions.length).toEqual(1)

        expect(activeSessions[0].pubkey).toEqual(formatPubkey(expiration[2]))
    })
})