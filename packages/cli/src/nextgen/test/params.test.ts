import path from 'path'
import params from '../getParams'
import { getRunnerArgs } from '../index'

import { expect } from '@jest/globals';

const fixture = (...segments: string[]) =>
  path.join(__dirname, 'fixtures', 'templates', ...segments)

describe('params', () => {
  beforeEach(() => {
    process.env.HYGEN_TMPLS = null
  })
  it('dont take template folder in template', async () => {
    const args = await params(
      { templates: fixture('template-folder-in-templates', '_templates') },
      getRunnerArgs(['dont-take-this', 'foo', 'bar', 'baz'])
    )
    expect(args).toEqual({
      action: 'foo',
      name: 'bar',
      subaction: undefined,
      actionfolder: fixture(
        'template-folder-in-templates',
        '_templates',
        'dont-take-this',
        'foo'
      ),
      generator: 'dont-take-this',
      templates: fixture('template-folder-in-templates', '_templates')
    })
  })

  it('env var overrides local templates but still take explicitly given templates', async () => {
    process.env.HYGEN_TMPLS = fixture('templates-override', 'tmpls')
    const args = await params(
      { templates: fixture('templates-override', '_templates') },
      getRunnerArgs(['dont-take-this', 'foo', 'bar', 'baz'])
    )
    expect(args).toEqual({
      action: 'foo',
      name: 'bar',
      subaction: undefined,
      generator: 'dont-take-this',
      actionfolder: fixture(
        'templates-override',
        '_templates',
        'dont-take-this',
        'foo'
      ),
      templates: fixture('templates-override', '_templates')
    })
  })
})