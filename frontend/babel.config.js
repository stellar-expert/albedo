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
                    targets: {
                        browsers: [
                            '> 1%',
                            'not ie 11',
                            'not op_mini all'
                        ],
                        node: '12'
                    }
                }
            ]
        ],
        plugins: [
            [
                '@babel/plugin-proposal-class-properties',
                {
                    loose: true
                }
            ],
            [
                '@babel/plugin-proposal-private-methods',
                {
                    loose: true
                }
            ],
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-syntax-dynamic-import',
        ]
    }
}
