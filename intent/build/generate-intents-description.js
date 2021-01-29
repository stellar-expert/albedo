const {intentInterface} = require('../lib/albedo.intent')

const defaults = {
    token: 'r9gbUuThXLr/wOrg2dxWHOO4DQsvQsTpkv1OtfETB3c=',
    message: 'Alice doesn\'t trust Bob',
    amount: '5',
    xdr: 'AAAAALPZeTF.......B0dpb99l',
    asset_code: 'EURT',
    asset_issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
    buy_asset_code: 'EURT',
    buy_asset_issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
    sell_asset_code: 'USD',
    sell_asset_issuer: 'GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX',
    max_price: '3.5',
    intents: 'tx,pay,trust,sign_message'
}

function generateExample(intent) {
    const {params} = intentInterface[intent],
        args = []

    for (let key of Object.keys(params)) {
        let val = defaults[key]
        if (typeof val === 'string') {
            if (!val) {
                val = undefined
            } else {
                val = `'${val.replace('\'', '\\\'')}'`
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
    return `albedo.${method}(${formattedArgs})
    .then(res => console.log(res))`
}

function generateDescription(intent) {
    const {title, description, params, returns} = intentInterface[intent]

    const requestParams = Object.entries(params)
        .map(([key, {description, type, required}]) =>
            `- \`${key}\` *(${type})* - *(${required ? 'required' : 'optional'})* ${description}`)

    const resultParams = Object.entries(returns)
        .map(([key, {description, type}]) =>
            `- \`${key}\` *(${type})* - ${description}`)

    return `
#### Intent \`${intent}\` - ${title}

${description}

**Parameters**

${requestParams.join('\n')}

**Returns**

${resultParams.join('\n')}

**Example**

\`\`\`js
${generateExample(intent)}
\`\`\`
`
}

function generateIntentsSection() {
    return Object.keys(intentInterface)
        .map(intent => generateDescription(intent))
        .join('')
}

module.exports = {generateIntentsSection}