import albedo, {intentInterface} from '@albedo-link/intent'

function parseOptions(scope) {
    const options = {}
    //parse options from attributes
    for (const attr of scope.attributes) {
        if (attr.name.indexOf('x-') === 0) {
            const paramName = attr.name.substr(2).replace(/-/g, '_')
            options[paramName] = attr.value
        }
    }
    //check whether intent is correct and retrieve corresponding interface
    const {intent} = options,
        intentDescriptor = intentInterface[intent]
    if (!intentDescriptor) {
        console.error(`Failed to initialize Albedo intent button. Unknown intent: "${intent}".`)
        return null
    }
    //validate intent params
    const {params: intentParams} = intentDescriptor
    for (const key of Object.keys(intentParams)) {
        const {required} = intentParams[key]
        if (required && !options[key]) {
            console.error(`Failed to initialize Albedo payment button. Mandatory option "${key}" is missing.`)
            return null
        }
    }
    return options
}

function createButton(scope) {
    const options = parseOptions(scope)
    if (!options) return null
    const {intent, 'class_name': className, width, height, title, ...params} = options
    //create a button
    const buttonElement = document.createElement('button')
    //set button attributes
    if (className) {
        buttonElement.className = className
    }
    if (width) {
        buttonElement.style.width = width + 'px'
    }
    if (height) {
        buttonElement.style.height = height + 'px'
    }
    buttonElement.innerText = buttonElement.value = title
    //insert it into the document
    scope.parentNode.appendChild(buttonElement)
    //bind onClick event
    buttonElement.addEventListener('click', () => {
        albedo.request(intent, {submit: 'true', ...params})
            .catch(e => console.error(e))
    }, false)
}

createButton(document.currentScript)




