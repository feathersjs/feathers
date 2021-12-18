import { join } from 'path'
import { VariablesAppBase } from '..';
import { GeneratorContext, RenderResult } from '../../../../src';
import { VariablesApp } from '../../new';

export function render (context: GeneratorContext<VariablesApp & VariablesAppBase>): RenderResult {
  const to = join(context.h.lib, 'logger.js');
  const body = `
import winston from 'winston';

const { createLogger, format, transports } = winston;

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
export const logger = createLogger({
  // To see more detailed errors, change this to 'debug'
  level: 'info',
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [
    new transports.Console()
  ],
});
`

  return { 
    body, 
    to
  }
}
