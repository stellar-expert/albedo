import stoplistTracker from '../../src/stoplist/stoplist-tracker'

describe('scam-tracker', () => {
    it('matches domains', () => {
        for (let blackListed of [/*'stellar.org.',*/ 'stellar.org.mu']) {
            expect(stoplistTracker.matchDomain('stellar.org.mu', blackListed)).toBeTruthy()
            expect(stoplistTracker.matchDomain('www.stellar.org.mu', blackListed)).toBeTruthy()
            expect(stoplistTracker.matchDomain('stellar.org', blackListed)).toBeFalsy()
            expect(stoplistTracker.matchDomain('otherstellar.org.mu', blackListed)).toBeFalsy()
            expect(stoplistTracker.matchDomain('stellar.org.munich', blackListed)).toBeFalsy()
        }
    })
})