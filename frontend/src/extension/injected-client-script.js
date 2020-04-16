import '../ui/intent/intent-script-global-import'
import {parseQuery} from '../util/url-utils'

function sep0007Handler(e) {
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
    albedo.request(intentName, params)
}

document.addEventListener('click', sep0007Handler, false)