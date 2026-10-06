export function defineConfig(userConfig = {}) {
  const defaultConfig = {
    defaultLanguage: 'en',
    autoDetectLanguage: true,
    source: 'src/',
    port: 2410,
    localeDir: 'cognates/',
    localeFilePattern: '{locale}.json',
    excludePaths: ['/assets/*'],
  };

  return { ...defaultConfig, ...userConfig };
}
