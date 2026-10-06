import { defineConfig } from 'cognates';

export default defineConfig({
    defaultLanguage: 'en',
    autoDetectLanguage: true,
    source: 'src/',
    port: 2410,
    localeDir: 'cognates/',
    localeFilePattern: '{locale}.json',
    excludePaths: ['/assets/*'],
});
/*
For CommonJS:
const { defineConfig } = require('cognates');

module.exports = defineConfig({
    defaultLanguage: 'en',
    autoDetectLanguage: true,
    source: 'src',
    port: 2410,
    localeDir: 'cognates/',
    localeFilePattern: '{locale}.json',
    excludePaths: ['/assets/*'],
});
*/
