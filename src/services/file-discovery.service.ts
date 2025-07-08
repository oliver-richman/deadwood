import { globby } from 'globby';
import { LogService } from './log.service.js';

export class FileDiscoveryService {

  public constructor(private readonly logService: LogService) {}

  public async findSourceFiles(): Promise<string[] | undefined> {
    this.logService.updateSpinner('Locating source files...')
    try {
      const files = await globby(['**/*.js', '**/*.ts'], {
        gitignore: true,
        ignore: ['**/node_modules/**', '**/dist/**'],
        absolute: false,
      });
      this.logService.updateSpinner('Located source files...')
      return files
    } catch (error) {
      this.logService.stopSpinner(1, 'Failed to locate source files.')
      this.logService.logFail(error as string)
    }
  }
}