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
    config: {
      tester: props.tester
    },
    'scripts': {
      test: `${packager} run eslint && NODE_ENV= ${packager} run ${props.tester}`,
      eslint: `eslint ${lib}/. test/. --config .eslintrc.json`,
      dev: `nodemon ${lib}/`,
      start: `node ${lib}/`
    }
  };
  if ('mocha' === props.tester) {
    pkg.scripts['mocha'] = 'mocha test/ --recursive --exit';
  } else {
    pkg.scripts['jest'] = 'jest';
  }

  return pkg;
};
