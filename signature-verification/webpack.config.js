const path = require('path'),
    webpack = require('webpack'),
    TerserPlugin = require('terser-webpack-plugin')

module.exports = function () {
    return {
        mode: 'production',
        devtool: 'source-map',
        entry: {
            'albedo.signature.verification': [path.join(__dirname, '/src/index.js')]
        },
        output: {
            path: path.join(__dirname, './lib'),
            filename: '[name].js',
            library: {
                name: 'albedoSignatureVerification',
                type: 'umd'
            },
            libraryTarget: 'umd',
            globalObject: 'this'
        },
        module: {
            rules: [
                {
                    test: /\.js?$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/
                }
            ]
        },
        plugins: [
            new webpack.IgnorePlugin(/ed25519/),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] })
        ],
        resolve: {
            fallback: {
                util: false,
                http: false,
                https: false,
                stream: false,
                path: false,
                fs: false,
                url: false
            }
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin({
                parallel: true,
                terserOptions: {
                    toplevel: true
                }
            })]
        }
    }
}