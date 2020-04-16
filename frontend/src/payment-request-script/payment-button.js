import intent from 'albedo-intent'

intent.frontendUrl = location.origin;

(function () {
    const scope = document.currentScript

    const options = {}

    for (const attr of scope.attributes) {
        if (attr.name.indexOf('x-') === 0) {
            options[attr.name.substr(2)] = attr.value
        }
    }

    function mussingMandatoryOption(name) {
        console.error(`Failed to initialize Albedo payment button. Mandatory option ${name} is missing.`)
    }

    if (!options.amount) return mussingMandatoryOption('amount')
    if (!options.destination) return mussingMandatoryOption('destination')
    if (!options.network) return mussingMandatoryOption('network')
    if (options['asset-code'] && options['asset-code'] !== 'XLM' && !options['asset-issuer']) return mussingMandatoryOption('asset-issuer')

    const buttonElement = document.createElement('button')

    if (options['class-name']) {
        buttonElement.className = options['class-name']
    }

    if (options.width) {
        buttonElement.style.width = options.width + 'px'
    }

    if (options.height) {
        buttonElement.style.height = options.height + 'px'
    }

    const {network, text, amount, destination, 'asset-code': assetCode, 'asset-issuer': assetIssuer, memo} = options

    let innerText = text || ''
    if (amount) {
        innerText += ` ${amount} ${assetCode || 'XLM'}`
    }
    buttonElement.innerText = innerText
    buttonElement.value = innerText

    const paymentParams = {
        network,
        amount,
        destination,
        submit: 'true'
    }

    if (memo) {
        paymentParams.memo = memo
    }
    if (assetCode) {
        paymentParams.asset_code = assetCode
    }
    if (assetIssuer) {
        paymentParams.asset_issuer = assetIssuer
    }

    scope.parentNode.appendChild(buttonElement)

    buttonElement.addEventListener('click', () => {
        intent.pay(paymentParams)
            .catch(e => console.error(e))
    }, false)
})()