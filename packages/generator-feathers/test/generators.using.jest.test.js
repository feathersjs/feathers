const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const cp = require('child_process');
const rp = require('request-promise');

// Start a process and wait either for it to exit
// or to display a certain text
const startAndWait = (cmd, args, options, text) => new Promise((resolve, reject) => {
  let buffer = '';
  const child = cp.spawn(cmd, args, options);
  const addToBuffer = data => {
    buffer += data;
    if(text && buffer.indexOf(text) !== -1) {
      resolve({ buffer, child });
    }
  };

  child.stdout.on('data', addToBuffer);
  child.stderr.on('data', addToBuffer);

  child.on('exit', status => {
    if(status !== 0) {
      return reject(new Error(buffer));
    }
    resolve({ buffer, child });
  });
});

const delay = ms => res => new Promise(resolve => setTimeout(() => resolve(res), ms));

describe('generator-feathers with jest', () => {

  let appDir;

  const runTest = expectedText => 
    startAndWait('npm', ['test'], { cwd: appDir }).then(({ buffer }) => {
      assert.ok(buffer.indexOf(expectedText) !== -1,
        'Ran test with text: ' + expectedText);
    });

  beforeEach(() =>
    helpers
      .run(path.join(__dirname, '..', 'generators', 'app'))
      .inTmpDir(dir => appDir = dir)
      .withPrompts({
        name: 'my_jest_app',
        providers: ['rest', 'socketio'],
        src: 'src',
        packager: 'npm@>= 3.0.0',
        tester: 'jest'
      }) // choose 'jest'
      .withOptions({ skipInstall: false })
  );

  it('feathers:app', () => 
    runTest('Feathers application tests (with jest').then(() => {
      const pkg = require(path.join(appDir, 'package.json'));
      const cfg = require(path.join(appDir, '.eslintrc.json'));
      assert.ok(pkg.devDependencies.jest, 'Added jest as a devDependency');
      assert.ok(cfg.env.jest, 'ESLint configured to support jest');
    })
  );

  it('feathers:hook', () => helpers
    .run(path.join(__dirname, '../generators/hook'))
    .inTmpDir(() => process.chdir(appDir))
    .withPrompts({ name: 'captain', type: 'before', services: [] })
    .then(() => runTest('test/hooks/captain.test.js'))
  );

  describe('feathers:service', () => {
    const testServiceGenerator = (adapter, database, id = null) => {
      return helpers
      .run(path.join(__dirname, '../generators/service'))
      .inTmpDir(() => process.chdir(appDir))
      .withPrompts({ adapter, database, name: adapter, path: adapter })
      .withOptions({ skipInstall: false })
      .then(() => runTest(`test/services/${adapter}.test.js`))
      .then(() => startAndWait('node', ['src/'], { cwd: appDir }, 'Feathers application started'))
      .then(delay(3000))
      .then(({ child }) => {
        const text = 'This is a jest.';
        const body = { text };
        if ('cassandra' === database) {
          body.id = 1;
        }
        return rp({
          url: `http://localhost:3030/${adapter}`,
          method: 'post',
          json: true,
          body
        })
        .then(res => {
          if (id) {
            assert.ok(typeof res[id] !== 'undefined');
          }
          assert.equal(res.text, text);
        })
        .then(() => child.kill())
        .catch(e => new Promise((resolve, reject) => {
          child.once('exit', () => reject(e));
          child.kill('SIGKILL')
        }));
      });
    };

    it('generic',   () => testServiceGenerator('generic'));
    it('memory',    () => testServiceGenerator('memory', null, 'id'));
    it('nedb',      () => testServiceGenerator('nedb', null, '_id'));
    it('mongodb',   () => testServiceGenerator('mongodb', 'mongodb', '_id'));
    it('mongoose',  () => testServiceGenerator('mongoose', 'mongodb', '_id'));
    it('knex',      () => testServiceGenerator('knex', 'sqlite', 'id'));
    it('sequelize', () => testServiceGenerator('sequelize', 'sqlite', 'id'));
    it('objection', () => testServiceGenerator('objection', 'sqlite', 'id'));
    // Don't fail to heed this warning... (hahaha)
    // requires locally installed and running instance of Apache Cassandra
    // on a Mac this can be installed with homebrew, i.e. brew install cassandra
    it.skip('cassandra', () => testServiceGenerator('cassandra', 'cassandra', 'id'));
    // same is true for rethinkdb. needs to be installed and running before test.
    // you may have to run the test twice: once to initialize the DB, then
    // another to see the test pass
    it.skip('rethinkdb', () => testServiceGenerator('rethinkdb', 'id'));
  });
});