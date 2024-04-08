import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.jest,
                ...globals.node,
            },
        },
        ignores: ['artifacts', 'builds', 'node_modules'],
    },
];
