import { defineConfig } from 'cognates';

export default defineConfig({
    defaultLanguage: 'en',
    autoDetectLanguage: true,
    source: 'src',
    serverPort: 2410,
    localeDir: '/cognates',
    excludePaths: ['/assets/*', '*.js'],
});
/*
For CommonJS:
const { defineConfig } = require('cognates');

module.exports = defineConfig({
    defaultLanguage: 'en',
    autoDetectLanguage: true,
    source: 'src',
    serverPort: 2410,
    localeDir: '/cognates',
    excludePaths: ['/assets/*', '*.js'],
});
*/