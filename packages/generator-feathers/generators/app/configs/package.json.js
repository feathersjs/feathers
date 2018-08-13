const semver = require('semver');

module.exports = function(generator) {
  const major = semver.major(process.version);
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
      lib,
      test: 'test/'
    },
    engines: {
      node: `^${major}.0.0`,
      [packager]: version
    },
    'scripts': {
      test: `${packager} run eslint && ${packager} run mocha`,
      eslint: `eslint ${lib}/. test/. --config .eslintrc.json`,
      dev: `nodemon ${lib}/`,
      start: `node ${lib}/`,
      mocha: 'mocha test/ --recursive --exit'
    }
  };

  return pkg;
};
