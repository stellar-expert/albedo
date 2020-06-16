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

export {parseQuery}
