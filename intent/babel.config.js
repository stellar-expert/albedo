module.exports = function (api) {
    api.cache(true)
    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    targets: {
                        'browsers': [
                            '> 1%',
                            'not ie 11',
                            'not op_mini all'
                        ]
                    }
                }
            ]
        ],
        plugins: [
            [
                "@babel/plugin-proposal-class-properties",
                {
                    "loose": true
                }
            ],
            "@babel/plugin-proposal-object-rest-spread"
        ]
    }
}