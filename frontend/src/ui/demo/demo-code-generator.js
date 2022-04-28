function serializeInvocationValue(value, level) {
    function space(level) {
        return ' '.repeat(level * 4)
    }

    if (value instanceof Array) {
        return `[
${space(level)}${value.map(v => serializeInvocationValue(v, level + 1)).join(',\n' + space(level))}
${space(level - 1)}]`
    }
    if (typeof value === 'object') {
        const args = []
        for (const key of Object.keys(value)) {
            let nestedValue = serializeInvocationValue(value[key], level + 1)
            if (nestedValue) {
                args.push(space(level) + `${key}: ${nestedValue}`)
            }
        }
        return !args.length ? '' : `{
${args.join(',\n')}
${space(level - 1)}}`
    }
    if (typeof value === 'string') {
        if (!value)
            return value
        return `'${value.trim().replace('\'', '\\\'')}'`
    }
    return value
}

export function generateInvocation(intent, params) {
    const formattedArgs = serializeInvocationValue(params, 1)
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
