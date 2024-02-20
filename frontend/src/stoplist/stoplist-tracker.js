import {fetchExplorerApi} from '@stellar-expert/ui-framework/api/explorer-api-call'

class StoplistTracker {
    stopList = []

    fetchPromise

    lastFetched = 0

    refreshTimeout = 5 * 60 * 1000 // five minutes by default

    /**
     * @return {Boolean}
     * @private
     */
    get shouldUpdate() {
        return new Date().getTime() - this.lastFetched > this.refreshTimeout
    }

    /**
     * @return {Promise}
     * @private
     */
    fetchStopList() {
        if (!this.fetchPromise) {
            //check whether the cache is stale
            if (!this.shouldUpdate)
                return Promise.resolve()
            //refetch fresh stoplist from Albedo
            this.fetchPromise = fetchExplorerApi('directory/blocked-domains?limit=1000')
                .then(data => {
                    //process data
                    this.stopList = data._embedded.records.map(m => m.domain)
                })
                .catch(e => {
                    console.error(e)
                    //failed to load
                })
                .finally(() => {
                    this.lastFetched = new Date().getTime()
                    this.fetchPromise = null
                })
        }
        return this.fetchPromise
    }

    /**
     * @param {String} domain
     * @param {String} possibleMatch
     * @return {Boolean}
     * @private
     */
    matchDomain(domain, possibleMatch) {
        if (domain.endsWith(possibleMatch)) {
            const prefix = domain.replace(possibleMatch, '')
            //consider only root domains and subdomains to handle things like "beststellar.org" or "tellar.org"
            return !prefix || prefix.endsWith('.')
        }
        return false
    }

    /**
     * Check whether a domain is in the stoplist
     * @param {String} domain
     * @return {Promise<Boolean>}
     */
    isDomainBlocked(domain) {
        domain = domain.toLowerCase()
        return this.fetchStopList()
            .then(() => this.stopList.some(entry => this.matchDomain(domain, entry)))
    }
}

export default new StoplistTracker()

