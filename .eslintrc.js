module.exports = {
    env: {
        node: true,
    },
    extends: ['eslint:recommended'],
    parser: 'babel-eslint',
    rules: {
        indent: [2, 4, { SwitchCase: 1 }],
        quotes: [2, 'single'],
        'dot-notation': [2, { allowKeywords: false }],
        'no-unused-vars': 0,
    },
};
