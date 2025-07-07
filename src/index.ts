#!/usr/bin/env node

import { Command } from 'commander';
import { getCliInfo } from './cliInfo';

const program = new Command();
const { CLI_NAME, CLI_DESCRIPTION, CLI_VERSION, CLI_LONG_DESCRIPTION } = getCliInfo();

program
  .name(CLI_NAME)
  .description(CLI_DESCRIPTION)
  .version(CLI_VERSION)
  .addHelpText('after', `\n${CLI_LONG_DESCRIPTION}`)
  .action(() => {
    console.log('deadwood command loaded');
  });

program.parse(process.argv);
