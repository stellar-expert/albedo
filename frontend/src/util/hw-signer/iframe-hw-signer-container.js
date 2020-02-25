import Signer from './hw-signer'
import trezorAdapter from './adapters/trezor-adapter'
import ledgerAdapter from './adapters/ledger-adapter'

export default async function func(window) {
    const signer = new Signer()

    window.addEventListener('message', async (event) => {
        if (event.data === Object(event.data) && event.data.type === 'signer') {
            if (event.data.action === 'init') {
                const appManifest = event.data.appManifest
                await signer.init({
                    appManifest
                })
                window.parent.postMessage(event.data, '*')
            }

            if (event.data.action === 'setAdapter') {
                //TODO: this logic is broken - wix it in the future
                const adapter = event.data.adapterName === 'trezor' ? trezorAdapter : ledgerAdapter
                signer.setAdapter(adapter)
                window.parent.postMessage(event.data, '*')
            }

            if (event.data.action === 'getAccount') {
                const {params} = event.data
                const publicKey = await signer.getPublicKey(params)
                event.data.result = publicKey
                window.parent.postMessage(event.data, '*')
            }

            if (event.data.action === 'signTransaction') {
                const params = event.data
                const signedTransaction = await signer.signTransaction(params)
                event.data.result = signedTransaction
                window.parent.postMessage(event.data, '*')
            }
        }
    })
}
