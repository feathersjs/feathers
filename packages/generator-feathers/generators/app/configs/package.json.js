'use strict';

module.exports = function(generator) {
  const { props } = generator;
  const lib = props.src;
  const [ packager, version ] = props.packager.split('@');
  const pkg = {
    name: props.name,
    description: props.description,
    version: '0.0.0',
    homepage: '',
    main: lib,
    keywords: [
      'feathers'
    ],
    author: {
      name: generator.user.git.name(),
      email: generator.user.git.email()
    },
    contributors: [],
    bugs: {},
    directories: {
      lib
    },
    engines: {
      node: '>= 6.0.0',
      [packager]: version
    },
    'scripts': {
      test: 'npm run eslint && npm run mocha',
      eslint: `eslint ${lib}/. test/. --config .eslintrc.json`,
      start: `node ${lib}/`,
      mocha: 'mocha test/ --recursive'
    }
  };

  return pkg;
};
