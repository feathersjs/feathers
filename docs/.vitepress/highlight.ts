import { IThemeRegistration, getHighlighter, HtmlRendererOptions } from 'shiki'
import type { ThemeOptions } from 'vitepress'
import { getJavaScript, PRETTIERRC } from '@feathersjs/generators/lib/commons'
import prettier from 'prettier'

/**
 * 2 steps:
 *
 * 1. convert attrs into line numbers:
 *    {4,7-13,16,23-27,40} -> [4,7,8,9,10,11,12,13,16,23,24,25,26,27,40]
 * 2. convert line numbers into line options:
 *    [{ line: number, classes: string[] }]
 */
const attrsToLines = (attrs: string): HtmlRendererOptions['lineOptions'] => {
  const result: number[] = []
  if (!attrs.trim()) {
    return []
  }
  attrs
    .split(',')
    .map((v) => v.split('-').map((v) => parseInt(v, 10)))
    .forEach(([start, end]) => {
      if (start && end) {
        result.push(...Array.from({ length: end - start + 1 }, (_, i) => start + i))
      } else {
        result.push(start)
      }
    })
  return result.map((v) => ({
    line: v,
    classes: ['highlighted']
  }))
}

export async function highlight(
  theme: ThemeOptions = 'material-palenight'
): Promise<(str: string, lang: string, attrs: string) => string> {
  const hasSingleTheme = typeof theme === 'string' || 'name' in theme
  const getThemeName = (themeValue: IThemeRegistration) =>
    typeof themeValue === 'string' ? themeValue : themeValue.name

  const highlighter = await getHighlighter({
    themes: hasSingleTheme ? [theme] : [theme.dark, theme.light]
  })
  const preRE = /^<pre.*?>/
  const vueRE = /-vue$/

  const highlightCode = (str: string, lang: string, attrs: string, additionalClass: string = '') => {
    const vPre = vueRE.test(lang) ? '' : 'v-pre'
    lang = lang.replace(vueRE, '').toLowerCase()

    const lineOptions = attrsToLines(attrs)

    if (hasSingleTheme) {
      return highlighter
        .codeToHtml(str, { lang, lineOptions, theme: getThemeName(theme) })
        .replace(preRE, `<pre ${vPre} class="${additionalClass}" data-language="${lang}">`)
    }

    const dark = highlighter
      .codeToHtml(str, { lang, lineOptions, theme: getThemeName(theme.dark) })
      .replace(preRE, `<pre ${vPre} class="vp-code-dark ${additionalClass}" data-language="${lang}">`)

    const light = highlighter
      .codeToHtml(str, { lang, lineOptions, theme: getThemeName(theme.light) })
      .replace(preRE, `<pre ${vPre} class="vp-code-light ${additionalClass}" data-language="${lang}">`)

    return dark + light
  }

  return (code: string, lang: string, attrs: string) => {
    if (lang === 'ts' || lang === 'typescript') {
      const prettierOptions = {
        ...PRETTIERRC,
        printWidth: 90
      }

      const javascript = getJavaScript(code)
      const formattedJS = prettier.format(javascript, {
        ...prettierOptions,
        parser: 'babel'
      })
      const formattedTS = prettier.format(code, {
        ...prettierOptions,
        parser: 'typescript'
      })
      const tsCode = highlightCode(formattedTS, lang, attrs, 'language-selectable')
      const jsCode = highlightCode(formattedJS, 'js', '', 'language-selectable')

      return tsCode + jsCode
    }

    return highlightCode(code, lang, attrs)
  }
}
