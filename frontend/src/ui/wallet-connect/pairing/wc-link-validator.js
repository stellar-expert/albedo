export function validateWCLink(value){
    return /wc:\w+@2/.test(value)
}