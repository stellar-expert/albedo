const path = require('path'),
    webpack = require('webpack'),
    TerserPlugin = require('terser-webpack-plugin')

module.exports = function () {
    const settings = {
        mode: 'production',
        devtool: 'source-map',
        entry: {
            'albedo.intent': [path.join(__dirname, '/src/index.js')]
        },
        output: {
            path: path.join(__dirname, './lib'),
            filename: '[name].js',
            library: 'albedo',
            libraryTarget: 'umd',
            libraryExport: 'default'
            /*chunkFilename: '[name].js',
            library: 'intentAlbedoLink',
            umdNamedDefine: true*/
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
            })
        ],
        node: {
            fs: 'empty',
        },
        optimization: {
            minimizer: [new TerserPlugin({
                parallel: true,
                sourceMap: true,
                terserOptions: {
                    //warnings: true,
                    toplevel: true
                }
            })]
        }
    }
    return settings
}