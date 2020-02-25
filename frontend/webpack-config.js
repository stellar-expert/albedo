const path = require('path'),
    pkgInfo = require('./package.json'),
    webpack = require('webpack'),
    autoprefixer = require('autoprefixer'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    cssnano = require('cssnano'),
    fs = require('fs')

module.exports = function (env, argv) {
    const mode = argv.mode || 'development'
    process.env.NODE_ENV = mode

    console.log('mode=' + mode)

    const isProduction = mode !== 'development'

    const settings = {
        mode,
        entry: {
            'albedo': [path.join(__dirname, './src/app.js')],
            'button': [path.join(__dirname, './src/button/button.js')]
        },
        output: {
            path: path.join(__dirname, './src/public/distr/'),
            filename: '[name].js',
            chunkFilename: '[name].js',
            publicPath: '/distr/'
        },
        module: {
            rules: [
                {
                    test: /\.js?$/,
                    loader: 'babel-loader'
                    //exclude: /node_modules/
                },
                {
                    test: /\.scss$/,
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
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: [
                                    autoprefixer(),
                                    cssnano({
                                        autoprefixer: true,
                                        discardComments: {removeAll: true}
                                    })
                                ],
                                sourceMap: !isProduction
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: !isProduction,
                                prependData: '@import "./src/ui/variables.scss";'
                            }
                        }
                    ]
                },
                {
                    test: /\.svg$/,
                    loader: 'svg-inline-loader'
                },
                {
                    test: /\.(html)$/,
                    use: {
                        loader: 'html-loader',
                        options: {
                            attrs: [':data-src'],
                            interpolate: true
                        }
                    }
                },
                {
                    test: /\.wasm$/,
                    // Tells WebPack that this module should be included as base64-encoded binary file and not as code
                    loaders: ['base64-loader'],
                    // Disables WebPack's opinion where WebAssembly should be, makes it think that it's not WebAssembly - Error: WebAssembly module is included in initial chunk.
                    type: 'javascript/auto'
                }
            ],
            noParse: /\.wasm$/ // Makes WebPack think that we don't need to parse this module, otherwise it tries to recompile it, but fails - Error: Module not found: Error: Can't resolve 'env'
        },
        plugins: [
            new webpack.IgnorePlugin(/ed25519/),
            new MiniCssExtractPlugin({
                filename: '[name].css'
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(mode),
                appVersion: JSON.stringify(pkgInfo.version)
            }),
            new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/)
        ],
        node: {
            fs: 'empty'
        },
        optimization: {},
        resolve: {
            alias: {
                components: path.resolve(__dirname, 'src/ui/components/')
            }
        }
    }

    if (!isProduction) {
        settings.devtool = 'source-map'
        settings.devServer = {
            historyApiFallback: {
                disableDotRule: true
            },
            compress: true,
            port: 5001,
            contentBase: [path.join(__dirname, './src/public/')],
            https: {
                key: fs.readFileSync('./certs/private.key'),
                cert: fs.readFileSync('./certs/private.crt'),
                ca: fs.readFileSync('./certs/private.pem')
            },
            setup(app) {
                const bodyParser = require('body-parser')
                app.use(bodyParser.urlencoded())
                app.post('*', (req, res) => {
                    const querystring = require('querystring')
                    res.redirect(req.originalUrl + '?' + querystring.stringify(req.body))
                })
            }
        }
    } else {
        settings.plugins.unshift(new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
            sourceMap: false
        }))

        const TerserPlugin = require('terser-webpack-plugin')

        settings.optimization.minimizer = [new TerserPlugin({
            parallel: true,
            sourceMap: false,
            terserOptions: {
                //warnings: true,
                toplevel: true
            }
        })]

        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
        settings.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-stats.html',
            openAnalyzer: false
        }))
    }
    return settings
}
