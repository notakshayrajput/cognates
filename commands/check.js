import { getConfigAsync } from '../lib/util.js';
import { checkLocales } from '../lib/check-locales.js';

export async function checkCommand(options = {}) {
  try {
    const config = await getConfigAsync();
    const { defaultFile, results } = await checkLocales(config);
    console.log(`Checking locales against ${defaultFile}`);
    let issueCount = 0;
    for (const { file, issues } of results) {
      console.log(`${file}: ${issues.length ? `${issues.length} issue(s)` : 'OK'}`);
      for (const issue of issues) {
        console.log(`  ${issue.kind}: ${issue.key}${issue.detail ? ` (${issue.detail})` : ''}`);
      }
      issueCount += issues.length;
    }
    console.log(`Checked ${results.length} locale(s); ${issueCount} issue(s).`);
    if (options.strict && issueCount) process.exitCode = 1;
  } catch (error) {
    console.error(`Cognates check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
