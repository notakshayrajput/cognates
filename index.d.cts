export interface CognatesConfig {
  defaultLanguage: string;
  autoDetectLanguage: boolean;
  source: string;
  port: number;
  localeDir: string;
  excludePaths: string[];
}

export declare function defineConfig(config?: Partial<CognatesConfig>): CognatesConfig;
