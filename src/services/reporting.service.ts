import { FileGroup } from '../types/file-group.interface.js';
import { DeadEntity } from '../types/dead-entity.interface.js';
import { LogService } from './log.service.js';
import { getNiceEntityType } from '../utils.js';

export class ReportingService {
  public constructor(private readonly logService: LogService) {}

  public report(deadEntityFileGroup: FileGroup<DeadEntity[]>) {
    let total = 0;
    let files = 0;
    for (const filePath in deadEntityFileGroup) {
      const deadEntities = deadEntityFileGroup[filePath].sort((deA, deB) => deA.line - deB.line);
      if (!deadEntities || !deadEntities.length) continue;
      files++;
      total += deadEntities.length;
      this.logService.logFilePath(filePath);
      for (const deadEntity of deadEntities) {
        const { entity, name, line, column } = deadEntity;
        this.logService.logDeadEntity({
          type: getNiceEntityType(entity, true),
          name,
          line,
          column,
        });
      }
      this.logService.addEmptyLine();
    }
    if (total === 0) {
      this.logService.logSuccess('No unused entities found!');
    } else {
      this.logService.logFail(
        `${files} file${files === 1 ? '' : 's'} affected, ${total} unused entit${total === 1 ? 'y' : 'ies'} found.`
      );
    }
  }
}
