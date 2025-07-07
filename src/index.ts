#!/usr/bin/env node

import { Command } from 'commander';
import { getCliInfo } from './cliInfo.js';
import { FileDiscoveryService } from './services/file-discovery.service.js';
import { AbstractSyntaxTreeService } from './services/abstract-syntax-tree.service.js';
import ora from 'ora';
import chalk from 'chalk';
import { getTotalArrayLength } from './utils.js';
import { FileGroup } from './types/file-group.interface.js';
import { DeadVariable } from './types/dead-variable.interface.js';

const program = new Command();
const { CLI_NAME, CLI_DESCRIPTION, CLI_VERSION, CLI_LONG_DESCRIPTION } = getCliInfo();

program
  .name(CLI_NAME)
  .description(CLI_DESCRIPTION)
  .version(CLI_VERSION)
  .addHelpText('after', `\n${CLI_LONG_DESCRIPTION}`)
  .action(async () => {
    const status = ora('Looking for deadwood...').start();
    const fileDiscoveryService = new FileDiscoveryService();
    const files = await fileDiscoveryService.findSourceFiles();
    status.text = 'Parsing files...';

    const abstractSyntaxTreeService = new AbstractSyntaxTreeService(files);
    abstractSyntaxTreeService.parseFiles();
    status.text = 'Searching for unused variables...';
    const deadVariablesFileGroup = abstractSyntaxTreeService.fetchDeadVariables();
    const filesCount = Object.keys(deadVariablesFileGroup).length;
    const deadVariablesCount = getTotalArrayLength<FileGroup<DeadVariable[]>>(deadVariablesFileGroup);
    if (!filesCount) {
      status.succeed('No unused variables found');
    } else {
      status.fail(`Found ${deadVariablesCount} unused variable${deadVariablesCount === 1 ? '' : 's'} across ${filesCount} file${filesCount === 1 ? '' : 's'}:`);
      Object.keys(deadVariablesFileGroup).forEach(filePath => {
        console.log(chalk.bold.underline.cyan(filePath));
        const deadVariables = deadVariablesFileGroup[filePath];
        deadVariables.forEach(dv => {
        console.log(
          `${chalk.gray('  •')} ${chalk.yellowBright(dv.name)} at ${chalk.gray(`line ${dv.line}`)}`
        );
        });
      });
    }

    console.log('');
    console.log('\n' + chalk.red(`💀 ${filesCount} files affected, ${deadVariablesCount} unused variables found.`));

  });

program.parse(process.argv);
