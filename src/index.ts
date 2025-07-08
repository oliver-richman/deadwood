#!/usr/bin/env node

import { FileDiscoveryService } from './services/file-discovery.service.js';
import { AbstractSyntaxTreeService } from './services/abstract-syntax-tree.service.js';
import { getNiceEntityType, joinWithAnd } from './utils.js';
import { CLIService } from './services/cli.service.js';
import { LogService } from './services/log.service.js';
import { SearchableEntities } from './types/searchable-entities.type.js';
import { ReportingService } from './services/reporting.service.js';

const cliService = new CLIService();
const logService = new LogService();
const fileDiscoveryService = new FileDiscoveryService(logService);
const abstractSyntaxTreeService = new AbstractSyntaxTreeService();
const reportingService = new ReportingService(logService);

cliService.program.action(async () => {
  const entitiesToSearchFor: SearchableEntities[] = [
    SearchableEntities.VARIABLES,
    SearchableEntities.FUNCTIONS,
    SearchableEntities.METHODS,
    SearchableEntities.CONSTRUCTOR_PARAMS,
    SearchableEntities.IMPORTS,
  ];

  logService.startSpinner('Finding source files...');
  const files = await fileDiscoveryService.findSourceFiles();

  if (!files || !files.length) {
    logService.stopSpinner(1, 'No source files to parse')
    return;
  } else {
    logService.stopSpinner(0, `${files.length} source files located.`)
  }

  logService.startSpinner('Parsing files...')
  const project = abstractSyntaxTreeService.parseFilesIntoProject(files);
  const sourceFiles = project.getSourceFiles();
  logService.stopSpinner(0, `${sourceFiles.length} files parsed.`)

  const formattedEntitiesToSearchFor = entitiesToSearchFor.map(e => getNiceEntityType(e, false))
  logService.startSpinner(`Finding unused ${joinWithAnd(formattedEntitiesToSearchFor)}`)
  const deadEntityFileGroup = abstractSyntaxTreeService.findDeadEntities(project, entitiesToSearchFor);
  logService.stopSpinner(0, `Finished finding unused ${joinWithAnd(formattedEntitiesToSearchFor)}`)

  logService.addEmptyLine()

  reportingService.report(deadEntityFileGroup);
});

cliService.program.parse(process.argv);
