import albedo, {intentInterface} from '@albedo-link/intent'

(function () {
    const scope = document.currentScript,
        options = {}

    for (const attr of scope.attributes) {
        if (attr.name.indexOf('x-') === 0) {
            options[attr.name.substr(2)] = attr.value
        }
    }

    function missingMandatoryOption(name) {
        console.error(`Failed to initialize Albedo payment button. Mandatory option "${name}" is missing.`)
    }

    const {network, text, amount, destination, 'asset-code': assetCode, 'asset-issuer': assetIssuer, memo, 'class-name': className, width, height} = options

    if (!amount) return missingMandatoryOption('amount')
    if (!destination) return missingMandatoryOption('destination')
    if (!network) return missingMandatoryOption('network')
    if (assetCode && assetCode !== 'XLM' && !assetIssuer) return missingMandatoryOption('asset-issuer')

    const buttonElement = document.createElement('button')

    buttonElement.className = className
    if (width) {
        buttonElement.style.width = width + 'px'
    }
    if (height) {
        buttonElement.style.height = height + 'px'
    }

    buttonElement.innerText = buttonElement.value = `${text ? text + ' ' : ''}${amount} ${assetCode || 'XLM'}`

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
        albedo.pay(paymentParams)
            .catch(e => console.error(e))
    }, false)
})()