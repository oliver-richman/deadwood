import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export class CLIService {
  public readonly program: Command;

  public constructor() {
    this.program = new Command();
    this.program.name('deadwood').description(this.getDescription()).version(this.getVersion());
  }

  private getVersion() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));

    return pkg.version;
  }

  private getDescription() {
    return 'deadwood is a powerful CLI tool for identifying and optionally removing dead code in JavaScript/TypeScript projects. Deadwood helps maintain clean and efficient codebases by detecting unused types, variables, functions, classes, imports, exports, and more.';
  }
}
