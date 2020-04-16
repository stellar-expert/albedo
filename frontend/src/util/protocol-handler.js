function registerProtocolHandler() {
    navigator.registerProtocolHandler('web+stellar', location.origin + '/web-stellar-handler?sep0007link=%s', 'Albedo')
}

export {registerProtocolHandler}