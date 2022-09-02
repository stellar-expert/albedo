module.exports = function (api) {
    api.cache(true)
    return {
        presets: [
            '@babel/preset-react',
            [
                '@babel/preset-env',
                {
                    corejs: 3,
                    useBuiltIns: 'entry',
                    modules: false,
                    targets: {
                        browsers: [
                            '> 1%',
                            'not ie 11',
                            'not op_mini all'
                        ],
                        node: '16'
                    }
                }
            ]
        ],
        plugins: [
            '@babel/plugin-syntax-dynamic-import'
        ]
    }
}
