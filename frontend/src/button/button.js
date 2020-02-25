import intent from 'albedo-intent'
intent.frontendUrl = 'https://localhost:9001'

import DonateTemplate from './designs/donate.html'

const scope = document.currentScript

const options = {
  width: scope.getAttribute('button-width'),
  height: scope.getAttribute('button-height'),
  text: scope.getAttribute('button-text'),
  amount: scope.getAttribute('intent-amount'),
  destination: scope.getAttribute('intent-destination'),
  asset_code: scope.getAttribute('intent-asset-code') || 'XLM',
  asset_issuer: scope.getAttribute('intent-asset-issuer'),
  memo: scope.getAttribute('intent-memo'),
  memo_type: scope.getAttribute('intent-memo-type'),
  network: scope.getAttribute('intent-network') || 'test'
}

if (!(options.width && options.height && options.amount && options.text)) {
  throw 'Some of mandatory parameters are missing'
}

const buttonElement = document.createElement('div')
buttonElement.width = options.width
buttonElement.height = options.height
buttonElement.innerHTML = parseTemplate(DonateTemplate, options)
buttonElement.addEventListener('click', async () => {
  await intent.pay({
    amount: options.amount,
    destination: options.destination
  })
})
scope.parentNode.insertBefore(buttonElement, scope.nextSibling)

function parseTemplate(template, params) {
  let result = template.trim()
  Object.keys(params).map((p) => {
    result = result.replace(`#{${p}}`, `${params[p]}`)
  })
  return result
}
