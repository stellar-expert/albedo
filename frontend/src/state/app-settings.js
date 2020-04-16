import merge from 'deepmerge'
import defaultConfig from '../../default-config'

const appSettings = merge(defaultConfig, typeof window !== 'undefined' && window.clientConfig || {})

export default appSettings