import Bignumber from 'bignumber.js'

export function denominate(valueInStroops) {
    if (valueInStroops instanceof Array)
        throw new Error('Invalid value to denominate')
    return new Bignumber(valueInStroops).div(10000000).toFixed(7).replace(/0+$/, '')
}
