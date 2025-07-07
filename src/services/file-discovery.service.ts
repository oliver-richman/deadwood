import { globby } from 'globby';

export class FileDiscoveryService {

  public async findSourceFiles(): Promise<string[]> {
    return globby(['**/*.js', '**/*.ts'], {
      gitignore: true,
      ignore: ['**/node_modules/**', '**/dist/**'],
      absolute: false,
    });
  }
}