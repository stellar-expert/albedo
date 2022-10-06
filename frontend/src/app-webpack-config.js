const path = require('path')
const {initWebpackConfig} = require('@stellar-expert/webpack-template')
const pkgInfo = require('../package.json')

const isProduction = !process.argv.some(a => a === '--mode=development')

module.exports = initWebpackConfig({
    entries: {
        'albedo': {
            import: './app.js',
            htmlTemplate: './static/app-html-template/index.html'
        },
        'albedo-intent': './ui/intent/intent-script-global-import.js',
        'albedo-intent-button': './button-script/intent-button-script.js',
        'albedo-payment-button': './button-script/intent-button-script.js' //legacy entry
    },
    projectRoot: __dirname,
    outputPath: path.join(__dirname, '../distr/app/'),
    staticFilesPath: [
        './static/shared/',
        './static/app/'
    ],
    scss: {
        additionalData: '@import "~@stellar-expert/ui-framework/basic-styles/variables.scss";'
        //+ '@import "~@stellar-expert/ui-framework/basic-styles/themes.scss";'
    },
    define: {
        appVersion: pkgInfo.version,
        albedoOrigin: !isProduction ? 'http://localhost:5001' : 'https://albedo.link',
        walletConnectBroker: process.env.WALLET_CONNECT_BROKER,
        onesignalAppId: process.env.ONESIGNAL_APP_ID,
        onesignalSafariId: process.env.ONESIGNAL_SAFARI_ID
    },
    devServer: {
        host: '0.0.0.0',
        https: false,
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
