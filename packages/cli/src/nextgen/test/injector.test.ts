import injector from '../ops/injector'
import { expect } from '@jest/globals'

const gemfile = `
    source 'http://rubygems.org'
    gem 'rails'
    gem 'nokogiri'
    gem 'httparty'
    `
describe('injector', () => {
  it('before rails', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            before: 'gem \'rails\''
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('after rails', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            after: 'gem \'rails\''
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('prepend top of file', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            prepend: true
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('append bottom of file', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            append: true
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('at_index 2 (below "source")', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            atLine: 2
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('skipIf "source" exists', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            skipIf: 'source',
            after: 'gem \'rails\''
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('if eofLast is false remove empty line from the end of injection body', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            after: 'gem \'rails\'',
            eofLast: false
          },
          body: '    gem \'kamikaze\' # added by hygen\n'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('if eofLast is true insert empty line to injection body', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            after: 'gem \'rails\'',
            eofLast: true
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('correctly interpret multi-line after regex', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            after: 'rails[a-z\\:\\/\\.\'\\s]*giri',
            eofLast: false
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('correctly interpret multi-line before regex', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            before: 'rails[a-z\\:\\/\\.\'\\s]*giri',
            eofLast: false
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
  it('correctly interpret multi-line skipIf regex', () => {
    expect(
      injector(
        {
          attributes: {
            to: '',
            skipIf: 'rails[a-z\\:\\/\\.\'\\s]*giri',
            after: 'gem \'rails\''
          },
          body: '    gem \'kamikaze\' # added by hygen'
        },
        gemfile
      )
    ).toMatchSnapshot()
  })
})