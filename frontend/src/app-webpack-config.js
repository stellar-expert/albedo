const path = require('path'),
    pkgInfo = require('../package.json'),
    webpack = require('webpack'),
    CopyPlugin = require('copy-webpack-plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    {webpackExcludeNodeModulesExcept} = require('@stellar-expert/webpack-utils')

module.exports = function (env, argv) {
    const mode = argv.mode || 'development'
    process.env.NODE_ENV = mode

    console.log('mode=' + mode)

    const isProduction = mode !== 'development'

    const fileNameFormat = isProduction ? '[name].[contenthash].js' : '[name].js'

    const settings = {
        mode,
        entry: {
            'albedo': [path.join(__dirname, './app.js')],
            'albedo-intent': [path.join(__dirname, './ui/intent/intent-script-global-import.js')],
            'albedo-intent-button': [path.join(__dirname, './button-script/intent-button-script.js')],
            'albedo-payment-button': [path.join(__dirname, './button-script/intent-button-script.js')] //legacy entry
        },
        output: {
            path: path.join(__dirname, '../distr/app/'),
            filename: pathData => {
                if (['albedo-intent', 'albedo-intent-button', 'albedo-payment-button'].includes(pathData.chunk.name)) return '[name].js'
                return `${pathData.runtime}.${pathData.hash}.js`
            },
            chunkFilename: pathData => {
                return `${pathData.chunk.name}.${pathData.chunk.hash}.js`
            },
            publicPath: '/',
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.js?$/,
                    loader: 'babel-loader',
                    exclude: webpackExcludeNodeModulesExcept('@stellar-expert/ui-framework')
                },
                {
                    test: /\.scss$/,
                    exclude: webpackExcludeNodeModulesExcept('@stellar-expert/ui-framework'),
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                                url: false,
                                sourceMap: !isProduction
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: !isProduction,
                                additionalData: '@import "./src/ui/styles.scss";'
                            }
                        }
                    ]
                },
                {
                    test: /\.svg$/,
                    loader: 'svg-inline-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.wasm$/,
                    loader: 'base64-loader',
                    type: 'javascript/auto'
                }
            ],
            noParse: /\.wasm$/
        },
        plugins: [
            new webpack.IgnorePlugin({
                checkResource(resource, context) {
                    if (/bip39[/\\]src$/.test(context)) {
                        if (resource.includes('/wordlists/')) {
                            return !resource.includes('english.json')
                        }
                    }
                    return false
                }
            }),
            new CopyPlugin({
                patterns: [
                    path.join(__dirname, './static/shared/'),
                    path.join(__dirname, './static/app/')
                ]
            }),
            new MiniCssExtractPlugin({
                filename: fileNameFormat + '.css'
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode),
                albedoOrigin: JSON.stringify(mode === 'development' ? 'https://localhost:5001' : 'https://albedo.link'),
                appVersion: JSON.stringify(pkgInfo.version)
            }),
            new webpack.ProvidePlugin({Buffer: ['buffer', 'Buffer']}),
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: './src/static/app-html-template/index.html',
                chunks: ['albedo']
            })
        ],
        optimization: {},
        resolve: {
            fallback: {
                util: false,
                http: false,
                https: false,
                path: false,
                fs: false,
                url: false,
                stream: require.resolve('stream-browserify')
            },
            symlinks: false,
            modules: [path.resolve(__dirname, '../node_modules'), 'node_modules']
        }
    }

    if (!isProduction) {
        settings.devtool = 'source-map'
        settings.devServer = {
            port: 5001,
            host: '0.0.0.0',
            allowedHosts: 'all',
            https: true,
            compress: true,
            hot: false,
            static: {
                directory: path.join(__dirname, './distr/app')
            },
            historyApiFallback: {
                disableDotRule: true
            }
        }
    } else {
        settings.plugins.unshift(new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
            sourceMap: false
        }))

        const TerserPlugin = require('terser-webpack-plugin'),
            CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

        settings.optimization.minimizer = [new TerserPlugin({
            terserOptions: {
                toplevel: true
            }
        }),
            new CssMinimizerPlugin()]

        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
        settings.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-stats.html',
            openAnalyzer: false
        }))
    }
    return settings
}
