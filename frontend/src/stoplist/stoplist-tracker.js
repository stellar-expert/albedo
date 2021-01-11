class StoplistTracker {
    stopList = []

    fetchPromise

    lastFetched = 0

    refreshTimeout = 1 * 60 * 1000 // every minute by default

    get shouldUpdate() {
        return new Date().getTime() - this.lastFetched > this.refreshTimeout
    }

    fetchStopList() {
        if (!this.fetchPromise) {
            //check whether the cache is stale
            if (!this.shouldUpdate) return Promise.resolve()
            //refetch fresh stoplist from Albedo
            this.fetchPromise = fetch(`${albedoOrigin}/stoplist?q=${new Date().getTime()}`)
                .then(res => res.text())
                .then(data => {
                    //process data
                    this.stopList = data.split('\n').map(d => d.trim().toLowerCase())
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

    isDomainBlocked(domain) {
        domain = domain.toLowerCase()
        return this.fetchStopList()
            .then(() => this.stopList.some(entry => this.matchDomain(domain, entry)))
    }

    matchDomain(domain, possibleMatch) {
        if (domain.endsWith(possibleMatch)) {
            const prefix = domain.replace(possibleMatch, '')
            //consider only root domains and subdomains to handle things like "beststellar.org" or "tellar.org"
            return !prefix || prefix.endsWith('.')
        }
        return false
    }
}

export default new StoplistTracker()

