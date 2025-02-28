export function defineConfig(userConfig = {}) {
    const defaultConfig = {
      defaultLanguage: 'en',
      autoDetectLanguage: true,
      source: 'src',
      port: 2410,
      localeDir: '/cognates',
      excludePaths: ['/assets/*', '*.js'],
    };
  
    return { ...defaultConfig, ...userConfig };
  }
  