# Cognates

Cognates is a command line tool and local browser editor for JSON translation files. Create a default locale, add languages, edit strings, generate a TypeScript shape from the default locale, and check translations for missing keys and placeholder mistakes. It works with React projects and other projects that use JSON locale files. Your application still chooses how to load and display translations at runtime.

## Requirements

- Node.js 20 or newer
- npm

## Quick start

Run these commands from your application's root directory:

```sh
npm install --save-dev cognates
npx cognates setup
npx cognates start
```

`setup` asks before creating `cognates.config.js`, then creates `cognates/en.json` if it does not exist. `start` opens the local editor at `http://127.0.0.1:2410` (or the port in your config). Keep the terminal open while editing.

Add your source strings to `cognates/en.json` as JSON. The editor can create another locale from its keys, leaving translation values empty. For example:

```json
{
  "home": {
    "title": "Hello {name}",
    "action": "Continue"
  }
}
```

## Commands

| Command | Purpose |
| --- | --- |
| `npx cognates setup` | Create a config and the default locale file when missing. |
| `npx cognates start` | Open the local browser editor. |
| `npx cognates generate-type` | Write `locale.ts` beside the default locale JSON. |
| `npx cognates check` | Report translation issues without editing files. |
| `npx cognates check --strict` | Exit with an error when issues are found, suitable for CI. |
| `npx cognates --version` | Print the installed package version. |

`check` compares every other JSON file in `localeDir` with the default language file. It reports missing and extra keys, empty values, unexpected value types, and mismatched placeholders such as `{name}` or `{0}`. Add `npx cognates check --strict` to your CI workflow to reject incomplete translations.

## Configuration

The CLI reads `cognates.config.js` from the current directory. `setup` writes a config appropriate for your project's `package.json`: ESM when `"type": "module"`, otherwise CommonJS. You can edit it later in the browser editor or by hand.

```js
import { defineConfig } from 'cognates';

export default defineConfig({
  defaultLanguage: 'en',
  autoDetectLanguage: true,
  source: 'src/',
  port: 2410,
  localeDir: 'cognates/',
  excludePaths: ['/assets/*'],
});
```

For a CommonJS project, use `const { defineConfig } = require('cognates')` and `module.exports = defineConfig({ ... })` instead. Use a project relative `localeDir`, such as `cognates/`; the CLI resolves it from the directory where you run it. `defaultLanguage` names the source JSON file, such as `en.json`. `port` controls the local editor port. `source`, `excludePaths`, and `autoDetectLanguage` are stored as configuration settings; the current CLI does not scan source code or select a language in your application at runtime.

## Development and release

From this repository:

```sh
npm ci
npm ci --prefix ui
npm test
npm run lint
npm run typecheck
npm pack --dry-run
```

`npm pack` and `npm publish` build the browser UI before creating the package. Review the tarball file list before publishing. The npm package version is `1.0.0`, corresponding to the `v1.0.0` release tag. Publishing requires access to the chosen package name on npm:

```sh
npm publish --access public
```

## License

ISC. You may use, modify, and redistribute Cognates if you keep the copyright and permission notice in the [LICENSE](LICENSE) file in copies you distribute.
