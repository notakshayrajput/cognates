export function defineConfig(userConfig = {}) {
    const defaultConfig = {
      defaultLanguage: 'en',
      autoDetectLanguage: true,
      source: 'src',
      serverPort: 2410,
      localeDir: '/cognates',
      excludePaths: ['/assets/*', '*.js'],
    };
  
    return { ...defaultConfig, ...userConfig };
  }
  