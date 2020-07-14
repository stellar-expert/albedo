function parseQuery(query = null) {
    if (query === null) {
        query = window.location.search
    }
    if (query[0] === '?') query = query.substr(1)
    const dest = {}
    for (let kv of query.split('&')) {
        const [key, value] = kv.split('=').map(v => decodeURIComponent(v))
        dest[key] = value
    }
    return dest
}

export function bindWebStellarLinkHandler(albedoIntent) {
    if (typeof (document) === 'undefined' || !document.addEventListener) return
    document.addEventListener('click', function sep0007Handler(e) {
        //we are only interested in links with "web+stellar" protocol
        if (e.target.tagName !== 'A' || (e.target.href || '').indexOf('web+stellar:') !== 0) return
        e.preventDefault()
        e.stopImmediatePropagation()
        const {pathname: intentName, search} = new URL(e.target.href)
        if (!['tx', 'pay'].includes(intentName)) {
            alert(`Invalid operation requested: ${intentName}. It's likely an external application error. Please contact support team of ${window.location.origin}.`)
            return
        }

        const params = parseQuery(search)
        albedoIntent.request(intentName, params)
    }, false)
}
