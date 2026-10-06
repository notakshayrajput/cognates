import { defineConfig } from 'cognates';

const config = defineConfig({ localeDir: 'translations/' });
const port: number = config.port;
void port;
