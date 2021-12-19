import picocolors from 'picocolors'
import { createColorize } from 'colorize-template'

const colorize = createColorize({
  ...picocolors,
  success: picocolors.green,
  error: picocolors.red
})

export class Logger {
  log: (message?: any, ...optionalParams: any[]) => void

  constructor (log: (message?: any, ...optionalParams: any[]) => void) {
    this.log = log
  }

  colorful (msg: string) {
    this.log(colorize`${msg}`)
  }

  notice (msg: string) {
    this.log(picocolors.magenta(msg))
  }

  warn (msg: string) {
    this.log(picocolors.yellow(msg))
  }

  err (msg: string) {
    this.log(picocolors.red(msg))
  }

  ok (msg: string) {
    this.log(picocolors.green(msg))
  }
}