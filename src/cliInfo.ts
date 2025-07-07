import { readFileSync } from 'fs';
import { join } from 'path';

export function getCliInfo() {
  const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

  return {
    CLI_NAME: 'deadwood',
    CLI_DESCRIPTION:
      'deadwood is a powerful CLI tool for identifying and optionally removing dead code in JavaScript/TypeScript projects. Deadwood helps maintain clean and efficient codebases by detecting unused types, variables, functions, classes, imports, exports, and more.',
    CLI_VERSION: pkg.version,
    CLI_LONG_DESCRIPTION: [
      '🪵 deadwood – TypeScript Dead Code Cleaner',
      'See https://github.com/oliver-richman/deadwood for more info.',
    ].join('\n'),
  };
}
