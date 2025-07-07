#!/usr/bin/env node

import { Command } from 'commander';
import { getCliInfo } from './cliInfo.js';
import { FileDiscoveryService } from './services/file-discovery.service.js';
import { AbstractSyntaxTreeService } from './services/abstract-syntax-tree.service.js';

const program = new Command();
const { CLI_NAME, CLI_DESCRIPTION, CLI_VERSION, CLI_LONG_DESCRIPTION } = getCliInfo();

program
  .name(CLI_NAME)
  .description(CLI_DESCRIPTION)
  .version(CLI_VERSION)
  .addHelpText('after', `\n${CLI_LONG_DESCRIPTION}`)
  .action(async () => {
    console.log('Looking for deadwood...');

    const fileDiscoveryService = new FileDiscoveryService();
    const files = await fileDiscoveryService.findSourceFiles();

    console.log(files);

    const abstractSyntaxTreeService = new AbstractSyntaxTreeService(files);
    console.log('Parsing files...')
    abstractSyntaxTreeService.parseFiles()
    console.log('Fetching dead variables...')
    abstractSyntaxTreeService.fetchDeadVariables();
    console.log('Complete!')
  });

program.parse(process.argv);
