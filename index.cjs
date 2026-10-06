const defaultConfig = {
  defaultLanguage: 'en',
  autoDetectLanguage: true,
  source: 'src/',
  port: 2410,
  localeDir: 'cognates/',
  excludePaths: ['/assets/*'],
};

exports.defineConfig = function defineConfig(userConfig = {}) {
  return { ...defaultConfig, ...userConfig };
};
