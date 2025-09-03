const {initWebpackConfig} = require('@stellar-expert/webpack-template')
const pkgInfo = require('./package.json')

const isProduction = !process.argv.some(a => a === '--mode=development')

const envVariables = ['STELLAR_BROKER_ORIGIN', 'STELLAR_BROKER_KEY', 'STELLAR_BROKER_QP']

module.exports = initWebpackConfig({
    entries: {
        'albedo': {
            import: './src/app.js',
            htmlTemplate: './src/static/app-html-template/index.html'
        },
        'albedo-intent': './src/ui/intent/intent-script-global-import.js',
        'albedo-intent-button': './src/button-script/intent-button-script.js',
        'albedo-payment-button': './src/button-script/intent-button-script.js' //legacy entry
    },
    outputPath: './distr/app/',
    staticFilesPath: ['./src/static/app/'],
    scss: {
        additionalData: '@import "~@stellar-expert/ui-framework/basic-styles/variables.scss";',
        sassOptions: {
            quietDeps: true,
            silenceDeprecations: ['import']
        }
        //+ '@import "~@stellar-expert/ui-framework/basic-styles/themes.scss";'
    },
    define: {
        appVersion: pkgInfo.version,
        isProduction,
        albedoOrigin: !isProduction ? 'http://localhost:5001' : 'https://albedo.link',
        ...envVariables.reduce((res, key) => {
            res['process.env.' + key] = process.env[key]
            return res
        }, {})
    },
    devServer: {
        host: '0.0.0.0',
        server: {
            type: 'http'
        },
        port: 5001
    },
    inlineSvg: true,
    ignoreCallback: function (resource, context) {
        if (/bip39[/\\]src$/.test(context)) {
            if (resource.includes('/wordlists/')) {
                return !resource.includes('english.json')
            }
        }
        return false
    }
})
