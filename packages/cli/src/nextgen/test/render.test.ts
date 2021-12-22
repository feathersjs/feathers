import render from '../render'
import path from 'path'
import snakeCase from 'lodash/snakeCase';

import { expect } from '@jest/globals';

const fixture = (...segments: string[]) => path.join(__dirname, './fixtures', ...segments)

describe('render ng', () => {
  it('should provide correct file name and body should be empty if template is empty', async () => {
    // setup
    // const expectedFile = /empty/
    const expectedBody = ''
    // act
    const actual = await render(
      { actionfolder: fixture('app', 'action-empty') },
      {}
    )
    // const actualFile = actual[0].file
    const actualBody = actual[0].body
    // assert
    // expect(actualFile).toMatch(expectedFile)
    expect(actualBody).toEqual(expectedBody)
  })
  it('should provide correct file name full and apply variable correctly ', async () => {
    // setup
    const expectedVariableText = /You owe 17/
    // const expectedFileName = /full/
    const expectedFilePath = 'foo/someone/bar'
    // act
    const actual = await render(
      {
        bill: 17,
        name: 'someone',
        actionfolder: fixture('app', 'action-full')
      },
      {}
    )
    // get template that was loaded
    // const actualFile = actual[0].file
    // get the To that was generated
    const actualTo = actual[0].attributes.to
    // get body that was generated from template
    const actualBody = actual[0].body
    // assert
    // is correct template file
    // expect(actualFile).toMatch(expectedFileName)
    // generated the correct To file
    expect(actualTo).toMatch(expectedFilePath)
    // i guess just testing this text is still there
    expect(actualBody).toMatch('Find me at <i>app/mailers/hello/html.ejs</i>')
    // applied bill variable correctly
    expect(actualBody).toMatch(expectedVariableText)
  })

  it('should capitalize', async () => {
    // setup
    // const expectedFile = /capitalized/
    const expectedBody = /someone and Someone/
    // act
    const response = await render(
      {
        name: 'someone',
        Name: 'Someone',
        actionfolder: fixture('app', 'action-capitalized')
      },
      {}
    )
    // const actualFile = response[0].file
    const actualBody = response[0].body
    // assert
    // expect(actualFile).toMatch(expectedFile)
    expect(actualBody).toMatch(expectedBody)
  })

  it('capitalized with default locals', async () => {
    // setup
    // const expectedFile = /capitalized/
    const expectedBody = /unnamed and Unnamed/
    // act
    const response = await render(
      {
        actionfolder: fixture('app', 'action-capitalized-defaults'),
        name: 'unnamed',
        Name: 'Unnamed'
      },
      {}
    )
    // const actualFile = response[0].file
    const actualBody = response[0].body
    // assert
    // expect(actualFile).toMatch(expectedFile)
    expect(actualBody).toMatch(expectedBody)
  })

  it('should render all files in an action folder ', async () => {
    // setup
    const expectedFileCount = 2
    // const expectedFileOne = /capitalized/
    // const expectedFileTwo = /full/
    // act
    const response = await render(
      {
        bill: 17,
        actionfolder: fixture('app', 'action-multifiles')
      },
      {}
    )
    const actualFileCount = response.length
    // const actualFileOne = response[0].file
    // const actualFileTwo = response[1].file
    // assert
    expect(actualFileCount).toEqual(expectedFileCount)
    // expect(actualFileOne).toMatch(expectedFileOne)
    // expect(actualFileTwo).toMatch(expectedFileTwo)
  })

  it('should include files nested subfolders', async () => {
    // setup
    const expectedFileCount = 2
    // const expectedFileOne = /capitalized/
    // const expectedFileTwo = /full/
    // act
    const response = await render(
      {
        bill: 17,
        actionfolder: fixture('app', 'action-multifiles-nest')
      },
      {}
    )
    const actualFileCount = response.length
    // const actualFileOne = response[0].file
    // const actualFileTwo = response[1].file
    // assert
    expect(actualFileCount).toEqual(expectedFileCount)
    // expect(actualFileOne).toMatch(expectedFileOne)
    // expect(actualFileTwo).toMatch(expectedFileTwo)
  })

  it('should filter what will be rendered only to that subaction value', async () => {
    // setup
    const expectedFileCount = 1
    // const expectedFile = /capitalized/
    // act
    const response = await render(
      {
        bill: 17,
        actionfolder: fixture('app', 'action-multifiles'),
        subaction: 'capitalized'
      },
      {}
    )
    const actualFileCount = response.length
    // const actualFile = response[0].file
    // assert
    expect(actualFileCount).toEqual(expectedFileCount)
    // expect(actualFile).toMatch(expectedFile)
  })

  // FIXME this test doesn't seem to be actually testing injection unless i'm missing something
  it('inject', async () => {
    const res = await render(
      {
        name: 'devise',
        actionfolder: fixture('app', 'action-inject')
      },
      {}
    )
    // expect(res[0].file).toMatch(/inject/)
    // res[0].file = 'inject.ejs.t'
    expect(res[0].body).toMatch('gem \'devise\'')
  })

  it('should allow to use changeCase helpers in templates', async () => {
    // setup
    // const expectedFile = /nake/
    // context.h.changeCase.snakeCase(context.name);
    const expectedBody = /foo_bar/
    // act
    const response = await render(
      {
        name: 'FooBar',
        actionfolder: fixture('app', 'action-change-case')
      },
      {
        helpers: {
          changeCase: {
            snakeCase
          }
        }
      }
    )
    // const actualFile = response[0].file
    const actualBody = response[0].body
    // assert
    // expect(actualFile).toMatch(expectedFile)
    expect(actualBody).toMatch(expectedBody)
  })

  it('should use config.localsDefaults for not passed parameters', async () => {
    // setup
    // const expectedFile = /full/
    const expectedBody = /localsDefaultBill/

    // act
    const response = await render(
      {
        actionfolder: fixture('app', 'action-full'),
        bill: 'localsDefaultBill',
        name: 'localsDefaultFileName'
      }, {}
    )
    // const actualFile = response[0].file
    const actualBody = response[0].body
    // assert
    // expect(actualFile).toMatch(expectedFile)
    expect(actualBody).toMatch(expectedBody)
  })
})