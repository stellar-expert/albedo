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

function parseStellarLink(link) {
    // web+stellar:tx?xdr=AAAAAP%2Byw%2BZEuNg533pUmwlYxfrq6%2FBoMJqiJ8vuQhf6rHWmAAAAZAB8NHAAAAABAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAA%2F7LD5kS42DnfelSbCVjF%2Burr8GgwmqIny%2B5CF%2FqsdaYAAAAAAAAAAACYloAAAAAAAAAAAA&callback=url%3Ahttps%3A%2F%2FsomeSigningService.com%2Fa8f7asdfkjha&pubkey=GAU2ZSYYEYO5S5ZQSMMUENJ2TANY4FPXYGGIMU6GMGKTNVDG5QYFW6JS&msg=order%20number%2024
    const [startsWith, transaction] = link.split(':')
    if (startsWith !== 'web+stellar') {
        throw 'not supported link type'
    }

    const [intent, params] = transaction.split('?')

    return {
      intent,
      network: 'testnet',
      prepare: intent === 'tx' ? 1 : 0,
      ...parseQuery(params)
    }
}

export { parseQuery, parseStellarLink }
