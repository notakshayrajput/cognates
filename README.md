# Cognates

Cognates is a lightweight and developer-friendly npm package for localizing strings in React applications. It simplifies internationalization (i18n) by providing an easy-to-use API for managing translations, supporting multiple languages, and enhancing user experience with seamless locale switching.

## Installation

To install the package globally for development:
``` cmd
npm install -g cognates
```
To use it without installation:
``` cmd
npx cognates setup
```

## Commands


``` cmd
npx cognates setup
```

Initializes `cognates.config.js` (or `.ts`) in your project.

`npx cognates start`

Starts the Cognates UI in the browser for managing localization files.

`npx cognates generate-type`

Generates `locale.ts` from the default language JSON file.

`npx cognates check`

Checks each locale against the default language and reports missing or extra keys, empty translations, unexpected value types, and mismatched `{name}` or `{0}` placeholders. It does not change any files. Use `npx cognates check --strict` in CI to exit with a nonzero status when issues are found.

# Adding New Commands
To add a new CLI command:
1. Create a new file in the `commands/` folder, e.g., `commands/newCommand.js`.
2. Define the function:

   ```ts
    export function newCommand() {
     console.log("Running newCommand...");
   }
   ```


3. Register it in `bin/cognates.js`:
   ```ts
    import { newCommand } from "../commands/newCommand.js";
   program
     .command("new")
     .description("Description of the command")
     .action(newCommand);
    ```


4. Run npm link to update the CLI.
5. Test the command:
   ```ts
   npx cognates new
   ```

# Updating the UI
1. Modify React components inside the ui/ folder.
2. To test changes, start the UI locally:
    ```ts
    npm run dev
    ```

3. Build the UI for production:
    ```ts
    npm run build
    ```

4. Ensure `start.js` serves the updated `ui/dist/` folder.

# Publishing the Package
1. Update the version in `package.json` (e.g., `1.0.1`).
2. Run:
    ```ts
    npm publish --access public
    ```

# Running the App in Development

   ```ts
   npx cognates start
   ```
This will launch the UI in the browser.

## Test a local build in the sample app

Run `npm run install:local` from the repository root. It builds the Cognates UI, runs `npm link` in this repository, then runs `npm link cognates` in `Test Environment`. The sample app now uses your current checkout, so rebuilding updates the linked package without publishing it.

# License

This package is not open for modifications. Users must credit the author when using Cognates.

