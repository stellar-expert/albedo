const container = document.createElement('iframe')
container.src = albedoOrigin + '/extension'
container.frameBorder = 0
Object.assign(container.style, {
    width: '100%',
    height: '100%',
    border: 'none'
})

document.body.appendChild(container)