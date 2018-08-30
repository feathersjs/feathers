const camelCase = require('lodash/camelCase');

module.exports = function(pkg) {
  const { scripts, name } = pkg;

  Object.assign(scripts, {
    clean: 'shx rm -rf dist/ && shx mkdir -p dist',
    prepublish: 'npm run browserify',
    'browserify:dist': `browserify lib/index.js -t babelify --standalone ${camelCase(name)} --outfile dist/${name}.js`,
    'browserify:min': `browserify lib/index.js -t babelify --standalone ${camelCase(name)} | uglifyjs > dist/${name}.min.js`,
    browserify: 'npm run clean && npm run browserify:dist && npm run browserify:min',
    'add-dist': 'npm run browserify && git add dist/ --force && git commit -am "Updating dist"',
    'release:pre': 'npm run add-dist && npm version prerelease && npm publish --tag pre',
    'release:patch': 'npm run add-dist && npm version patch && npm publish',
    'release:minor': 'npm run add-dist && npm version minor && npm publish',
    'release:major': 'npm run add-dist && npm version major && npm publish',
    test: 'npm run browserify && npm run lint && npm run coverage'
  });

  return pkg;
};
