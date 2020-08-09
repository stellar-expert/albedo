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
        ]
    }
}