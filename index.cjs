const defaultConfig = {
  defaultLanguage: 'en',
  autoDetectLanguage: true,
  source: 'src/',
  port: 2410,
  localeDir: 'cognates/',
  localeFilePattern: '{locale}.json',
  excludePaths: ['/assets/*'],
};

exports.defineConfig = function defineConfig(userConfig = {}) {
  return { ...defaultConfig, ...userConfig };
};
