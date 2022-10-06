const path = require('path')
const {initWebpackConfig} = require('@stellar-expert/webpack-template')
const pkgInfo = require('../package.json')

const isProduction = !process.argv.some(a => a === '--mode=development')

module.exports = initWebpackConfig({
    entries: {
        'albedo-contentscript': './extension/contentscript.js',
        'albedo-background': './extension/background.js',
        'albedo-ext-ui': './extension.js'
    },
    projectRoot: __dirname,
    outputPath: '../distr/extension/',
    staticFilesPath: [
        './static/shared/',
        {
            from: path.join(__dirname, './static/extension/'),
            transform(content, absoluteFrom) {
                if (isProduction && absoluteFrom.includes('manifest.json')) {
                    content = content.toString('utf8').replace(/http:\/\/localhost:5001/g, 'https://albedo.link')
                    return Buffer.from(content, 'utf8')
                }
                return content
            }
        }
    ],
    scss: {
        disabled: true
    },
    define: {
        appVersion: pkgInfo.version,
        albedoOrigin: !isProduction ? 'http://localhost:5001' : 'https://albedo.link'
    }
})
