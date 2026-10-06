# Cognates

Cognates is a command line tool and local browser editor for JSON translation files. Create a default locale, add languages, edit strings, generate a TypeScript shape from the default locale, and check translations for missing keys and placeholder mistakes. It works with React projects and other projects that use JSON locale files. Your application still chooses how to load and display translations at runtime.

## Requirements

- Node.js 20 or newer
- npm

## Quick start

Choose one package name, then run the CLI from your application's root directory. Both packages install the `cognates` command:

```sh
npm install --save-dev @akshay-rajput/cognates
# Or: npm install --save-dev cognates
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
| `npx cognates generate-type` | Write `locale.ts` in `localeDir` from the default locale JSON. |
| `npx cognates check` | Report translation issues without editing files. |
| `npx cognates check --strict` | Exit with an error when issues are found, suitable for CI. |
| `npx cognates --version` | Print the installed package version. |

`check` compares every locale file matching `localeFilePattern` with the default language file. It reports missing and extra keys, empty values, unexpected value types, and mismatched placeholders such as `{name}` or `{0}`. Add `npx cognates check --strict` to your CI workflow to reject incomplete translations.

## Configuration

The CLI reads `cognates.config.js` from the current directory. `setup` writes a config appropriate for your project's `package.json`: ESM when `"type": "module"`, otherwise CommonJS. You can edit it later in the browser editor or by hand.

```js
import { defineConfig } from '@akshay-rajput/cognates';

export default defineConfig({
  defaultLanguage: 'en',
  autoDetectLanguage: true,
  source: 'src/',
  port: 2410,
  localeDir: 'cognates/',
  localeFilePattern: '{locale}.json',
  excludePaths: ['/assets/*'],
});
```

If you installed the unscoped package, import from `cognates` instead. `setup` writes the correct import automatically. For a CommonJS project, use `const { defineConfig } = require('@akshay-rajput/cognates')` and `module.exports = defineConfig({ ... })` instead. Use a project relative `localeDir`, such as `cognates/`; the CLI resolves it from the directory where you run it. `defaultLanguage` names the source locale code, such as `en`. `port` controls the local editor port. `source`, `excludePaths`, and `autoDetectLanguage` are stored as configuration settings; the current CLI does not scan source code or select a language in your application at runtime.

### Locale folders

To use one JSON file per language folder, set:

```js
localeDir: 'src/i18n',
localeFilePattern: '{locale}/translation.json',
```

With `defaultLanguage: 'en'`, Cognates reads `src/i18n/en/translation.json` and finds other locales such as `src/i18n/es/translation.json`. `setup` creates the default file at that path if it is missing. The editor creates new locale folders and `translation.json` files as needed; `check` and key renaming use the same layout. You can substitute another fixed JSON filename, such as `{locale}/common.json`. The default pattern remains `{locale}.json` for existing configs. Cognates only looks at immediate locale folders and the configured JSON filename; it does not scan nested namespaces or mix both layouts. Generated `locale.ts` is written in `localeDir` for either layout.

## Development and release

From this repository, after installing development dependencies on a clean checkout:

```sh
npm test
npm run lint
npm run typecheck
npm pack --dry-run
npm run prepare:scoped
npm pack .release/scoped --dry-run
```

`npm pack` builds the browser UI for the unscoped package. `prepare:scoped` runs the release checks and build, then copies the same runtime files into `.release/scoped` with the package name `@akshay-rajput/cognates`. Review both file lists before publishing. The `cognates` command remains the same in both packages.

For this release, `cognates@1.0.0` is already published. Publish only the new scoped package after signing in to the official npm registry:

```sh
npm login --registry=https://registry.npmjs.org/ --offline=false
npm publish .release/scoped --access public --registry=https://registry.npmjs.org/ --offline=false
```

For later releases, update the root version, rebuild `.release/scoped`, and publish both package names at the same version. Run `npm publish --access public` from the repository root for `cognates`, then publish `.release/scoped` for `@akshay-rajput/cognates`.

## License

ISC. You may use, modify, and redistribute Cognates if you keep the copyright and permission notice in the [LICENSE](LICENSE) file in copies you distribute.
