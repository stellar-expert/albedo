export class FrameWrapper {
  constructor(win) {
    this.win = win
    this.instance = null
    this.cw = null
  }

  init({ src, appManifest }) {
    return new Promise((resolve, reject) => {
      const existedFrame = this.win.document.getElementById('stellarSigner')
      if (existedFrame) {
        this.instance = existedFrame
        this.instance.src = src
      } else {
        this.instance = this.win.document.createElement('iframe')
        this.instance.frameBorder = '0'
        this.instance.width = '0px'
        this.instance.height = '0px'
        this.instance.style.position = 'absolute'
        this.instance.style.display = 'none'
        this.instance.style.border = '0px'
        this.instance.style.width = '0px'
        this.instance.style.height = '0px'
        this.instance.id = 'stellarSigner'
        this.instance.src = src
        this.win.document.body.appendChild(this.instance)
      }
      this.cw = this.instance.contentWindow
      return new Promise((resolve, reject) => {
        this.cw.postMessage({
          type: 'signer',
          action: 'init',
          appManifest
        }, '*')

        this.cw.addEventListener('message', function(event) {
          if (event.data.type === 'signer' && event.data.action === 'init') {
            this.cw.removeEventListener('message', this)
            resolve(true)
          }
        })
      })
    })
  }

  setAdapter(adapterName) {
    return new Promise((resolve, reject) => {
      this.cw.postMessage({
        type: 'signer',
        action: 'setAdapter',
        adapterName
      }, '*')

      this.cw.addEventListener('message', function(event) {
        if (event.data.type === 'signer' && event.data.action === 'setAdapter') {
          this.cw.removeEventListener('message', this)
          resolve(event.data.result)
        }
      })
    })
  }

  getAccount(params) {
    return new Promise((resolve, reject) => {
      this.cw.postMessage({
        type: 'signer',
        action: 'getAccount',
        params
      }, '*')

      this.cw.addEventListener('message', function(event) {
        if (event.data.type === 'signer' && event.data.action === 'getAccount') {
          this.cw.removeEventListener('message', this)
          resolve(event.data.result)
        }
      })
    })
  }

  signTransaction(params) {
    return new Promise((resolve, reject) => {
      this.cw.postMessage({
        type: 'signer',
        action: 'signTransaction',
        params
      }, '*')

      this.cw.addEventListener('message', function(event) {
        if (event.data.type === 'signer' && event.data.action === 'signTransaction') {
          this.cw.removeEventListener('message', this)
          resolve(event.data.result)
        }
      })
    })
  }
}
