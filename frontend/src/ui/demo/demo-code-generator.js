export function generateInvocation(intent, params) {
    const args = []

    for (const key of Object.keys(params)) {
        let val = params[key]
        if (typeof val === 'string') {
            if (!val) {
                val = undefined
            } else {
                val = `'${val.trim().replace('\'', '\\\'')}'`
            }
        }
        if (val) {
            args.push(`    ${key}: ${val}`)
        }
    }

    const formattedArgs = !args.length ? '' : `{
${args.join(',\n')}
}`

    const method = intent.replace(/_([a-z])/g, g => g[1].toUpperCase())
    return `albedo.${method}(${formattedArgs})`
}

export function generateAlbedoCode(intent, params, returns) {
    const formattedOutput = Object.keys(returns).map(returnParam => 'res.' + returnParam).join(', ')

    return `${generateInvocation(intent, params)}
    .then(res => console.log(${formattedOutput}))`
}

export function getIntentTitle(intent) {
    return intent === 'pay' ? 'pay' : 'sign transaction'
}

export function generateButtonScriptCode(intent, params) {
    params = {
        intent,
        ...params,
        height: '30',
        width: '200',
        'class-name': 'albedo-button',
        title: getIntentTitle(intent)
    }
    params = Object.keys(params).map(key => {
        const value = params[key]
        if (!value) return null
        return `x-${key}="${value.trim().replace('"', '\"')}"`
    }).filter(v => !!v)
    return `<script src="${location.origin}/albedo-intent-button.js"
  ${params.join('\n  ')} 
  async>
</script>`
}

export function generateWebStellarLinkCode(intent, params) {
    const formatted = Object.keys(params)
        .filter(key => !!params[key])
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return `web+stellar:${intent}?${formatted.join('&')}`
}
