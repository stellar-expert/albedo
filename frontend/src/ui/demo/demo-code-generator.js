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

export function generateAlbedoCode(intent, params, returns){
    const formattedOutput = returns.map(returnParam => 'res.' + returnParam).join(', ')

    return `${generateInvocation(intent, params)}
    .then(res => console.log(${formattedOutput}))`
}


export function generateButtonScriptCode(params) {
    params = Object.keys(params).map(key => {
        const value = params[key]
        if (!value) return null
        return `x-${key}="${value.trim().replace('"', '\"')}"`
    }).filter(v => !!v)
    return `<script src="${location.origin}/albedo-payment-button.js" ${params.join(' ')} async></script>`
}