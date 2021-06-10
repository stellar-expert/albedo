const path = require('path'),
    pkgInfo = require('../package.json'),
    webpack = require('webpack'),
    CopyPlugin = require('copy-webpack-plugin')

module.exports = function (env, argv) {
    const mode = argv.mode || 'development'
    process.env.NODE_ENV = mode

    console.log('mode=' + mode)

    const isProduction = mode !== 'development'

    const fileNameFormat = '[name]'

    const settings = {
        mode,
        entry: {
            'albedo-contentscript': [path.join(__dirname, './extension/contentscript.js')],
            'albedo-background': [path.join(__dirname, './extension/background.js')],
            'albedo-ext-ui': [path.join(__dirname, './extension.js')]
        },
        output: {
            path: path.join(__dirname, '../distr/extension'),
            filename: fileNameFormat + '.js',
            publicPath: '/'
        },
        module: {
            rules: [
                {
                    test: /\.js?$/,
                    loader: 'babel-loader'
                    //exclude: /node_modules/
                }
            ]
        },
        plugins: [
            new webpack.IgnorePlugin(/ed25519/),
            new CopyPlugin({
                patterns: [
                    path.join(__dirname, './static/shared/'),
                    {
                        from: path.join(__dirname, './static/extension/'),
                        transform(content, absoluteFrom) {
                            if (mode !== 'development' && absoluteFrom.includes('manifest.json')) {
                                content = content.toString('utf8').replace(/https:\/\/localhost:5001/g, 'https://albedo.link')
                                return Buffer.from(content, 'utf8')
                            }
                            return content
                        }
                    }
                ]
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode),
                albedoOrigin: JSON.stringify(mode === 'development' ? 'https://localhost:5001' : 'https://albedo.link'),
                appVersion: JSON.stringify(pkgInfo.version)
            })
        ],
        optimization: {}
    }

    if (!isProduction) {
        settings.devtool = 'source-map'
    } else {
        settings.plugins.unshift(new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
            sourceMap: false
        }))

        const TerserPlugin = require('terser-webpack-plugin')

        settings.optimization.minimizer = [new TerserPlugin({
            terserOptions: {
                toplevel: true
            }
        })]
    }
    return settings
}
