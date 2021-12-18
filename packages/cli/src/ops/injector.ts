import { RenderedAction } from '../types'
import newline from '../newline'
import { RenderAttributes } from '..'

const EOLRegex = /\r?\n/

const getPragmaticIndex = (
    pattern: string | RegExp,
    lines: string[],
    isBefore: boolean
) => {
  const oneLineMatchIndex = lines.findIndex(l => l.match(pattern))

  // joins the text and looks for line number,
  // we dont care about platform line-endings correctness other than joining/splitting
  // for all platforms
  if (oneLineMatchIndex < 0) {
    const fullText = lines.join('\n')
    const fullMatch = fullText.match(new RegExp(pattern, 'm'))

    if (fullMatch && fullMatch.length) {
      if (isBefore) {
        const fullTextUntilMatchStart = fullText.substring(0, fullMatch.index)
        return fullTextUntilMatchStart.split(EOLRegex).length - 1
      }
      const matchEndIndex = fullMatch.index + fullMatch.toString().length
      const fullTextUntilMatchEnd = fullText.substring(0, matchEndIndex)
      return fullTextUntilMatchEnd.split(EOLRegex).length
    }
  }

  return oneLineMatchIndex + (isBefore ? 0 : 1)
}
const locations = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  atLine: (_: number, _lines: string[]): number => _,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prepend: (_: string, _lines: string[]): number => 0,
  append: (_: string, lines: string[]): number => lines.length - 1,
  before: (_: string, lines: string[]): number => getPragmaticIndex(_, lines, true),
  after: (_: string, lines: string[]): number => getPragmaticIndex(_, lines, false)
}

const indexByLocation = (
    attributes: RenderAttributes,
    lines: string[]
): number => {
  const pair = Object.entries(attributes).find(([k]) => k in locations)
  if (pair) {
    const [k, v] = pair
    // @ts-ignore
    return locations[k](v, lines)
  }
  return -1
}
const injector = (action: RenderedAction, content: string): string => {
  const {
    attributes: { skipIf, eofLast },
    attributes,
    body
  } = action
  // eslint-disable-next-line
  const shouldSkip = skipIf && !!content.match(skipIf);

  if (!shouldSkip) {
    //
    // we care about producing platform-correct line endings.
    // however the "correct" line endings should be detected from the actual
    // CONTENT given, and not the underlying operating system.
    // this is similar to how a text editor behaves.
    //
    const NL = newline(content)
    const lines = content.split(NL)

    // returns -1 (end) if no attrs
    const idx = indexByLocation(attributes, lines)

    // eslint-disable-next-line
    const trimEOF = idx >= 0 && eofLast === false && /\r?\n$/.test(body);
    // eslint-disable-next-line
    const insertEOF = idx >= 0 && eofLast === true && !/\r?\n$/.test(body);

    if (trimEOF) {
      lines.splice(idx, 0, body.replace(/\r?\n$/, ''))
    } else if (insertEOF) {
      lines.splice(idx, 0, `${body}${NL}`)
    } else if (idx >= 0) {
      lines.splice(idx, 0, body)
    }
   return lines.join(NL)
  } else {
    return content
  }
}

export default injector