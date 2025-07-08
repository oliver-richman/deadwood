import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class LogService {
  private spinner: Ora | undefined;

  public startSpinner(initialText: string) {
    this.spinner = ora(initialText).start();
  }

  public updateSpinner(newText: string) {
    if (!this.spinner) return;

    this.spinner.text = newText;
  }

  public stopSpinner(status: number, text: string) {
    if (!this.spinner) return;

    if (status === 0) {
      this.spinner.succeed(text);
    } else {
      this.spinner.fail(text);
    }

    this.spinner = undefined;
  }

  public addEmptyLine() {
    console.log('');
  }

  public logFilePath(filePath: string) {
    console.log(chalk.bold.underline.cyan(filePath));
  }

  public logDeadEntity({
    type,
    name,
    line,
    column,
  }: {
    type: string;
    name: string;
    line: number;
    column: number;
  }) {
    console.log(
      `${chalk.gray('  •')} Unused ${chalk.yellow(type)} ${chalk.magenta(name)} at ${chalk.gray(`line ${line}, column ${column}`)}`
    );
  }

  public logSuccess(log: string) {
    console.log(chalk.green(log));
  }

  public logFail(log: string) {
    console.log(chalk.red(log));
  }
}
