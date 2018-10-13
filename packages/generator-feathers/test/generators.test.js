const path = require('path');
const helpers = require('yeoman-test');
const assert = require('yeoman-assert');
const cp = require('child_process');
const rp = require('request-promise');

// Start a process and wait either for it to exit
// or to display a certain text
function startAndWait(cmd, args, options, text) {
  return new Promise((resolve, reject) => {
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
}

function delay(ms) {
  return function(res) {
    return new Promise(resolve => setTimeout(() => resolve(res), ms));
  };
}

describe('generator-feathers', function() {
  this.timeout(300000);

  let appDir;

  function runTest(expectedText) {
    return startAndWait('npm', ['test'], { cwd: appDir })
      .then(({ buffer }) => {
        assert.ok(buffer.indexOf(expectedText) !== -1,
          'Ran test with text: ' + expectedText);
      });
  }

  beforeEach(() => helpers.run(path.join(__dirname, '..', 'generators', 'app'))
    .inTmpDir(dir => (appDir = dir))
    .withPrompts({
      name: 'myapp',
      providers: ['rest', 'socketio'],
      src: 'src',
      packager: 'npm@>= 3.0.0'
    })
    .withOptions({
      skipInstall: false
    })
  );

  it('feathers:app', () =>
    runTest('starts and shows the index page').then(() => {
      const pkg = require(path.join(appDir, 'package.json'));
      switch(pkg.config.tester) {
        case 'jest': assert.ok(pkg.devDependencies.jest, 'Added jest as a devDependency'); break;
        case 'mocha':
        default: assert.ok(pkg.devDependencies.mocha, 'Added mocha as a devDependency');
      }
    })
  );

  it('feathers:hook', () => {
    return helpers.run(path.join(__dirname, '../generators/hook'))
      .inTmpDir(function() {
        process.chdir(appDir);
      })
      .withPrompts({
        name: 'removeId',
        type: 'before',
        services: []
      })
      .then(() => runTest('\'removeId\' hook'));
  });

  it('feathers:middleware', () => {
    return helpers.run(path.join(__dirname, '../generators/middleware'))
      .inTmpDir(function() {
        process.chdir(appDir);
      })
      .withPrompts({
        name: 'testmiddleware',
        path: '*'
      });
  });

  describe('feathers:connection', () => {
    function runConnectionGenerator(prompts) {
      return helpers.run(path.join(__dirname, '..', 'generators', 'connection'))
        .inTmpDir(() => process.chdir(appDir))
        .withPrompts(prompts)
        .withOptions({ skipInstall: false });
    }

    it('nedb', () => {
      return runConnectionGenerator({
        database: 'nedb',
        connectionString: 'nedb://../mytest'
      }).then(() =>
        assert.jsonFileContent(
          path.join(appDir, 'config', 'default.json'),
          { nedb: '../mytest' }
        )
      ).then(() => runTest('starts and shows the index page'));
    });

    describe('mongodb', () => {
      it('mongodb', () => {
        const connectionString = 'mongodb://localhost:27017/testing';

        return runConnectionGenerator({
          database: 'mongodb',
          adapter: 'mongodb',
          connectionString
        }).then(() =>
          assert.jsonFileContent(
            path.join(appDir, 'config', 'default.json'),
            { mongodb: connectionString }
          )
        ).then(() => runTest('starts and shows the index page'));
      });

      it('mongoose', () => {
        const connectionString = 'mongodb://localhost:27017/testing';

        return runConnectionGenerator({
          database: 'mongodb',
          adapter: 'mongoose',
          connectionString
        }).then(() =>
          assert.jsonFileContent(
            path.join(appDir, 'config', 'default.json'),
            { mongodb: connectionString }
          )
        ).then(() => runTest('starts and shows the index page'));
      });
    });

    describe.skip('postgres', () => {

    });

    describe.skip('mysql', () => {

    });

    describe.skip('mssql', () => {

    });

    describe('sqlite', () => {
      it('knex', () => {
        const connectionString = 'sqlite://data.sqlite';

        return runConnectionGenerator({
          database: 'sqlite',
          adapter: 'knex',
          connectionString
        }).then(() =>
          assert.jsonFileContent(
            path.join(appDir, 'config', 'default.json'), {
              sqlite: {
                connection: {
                  filename: 'data.sqlite'
                },
                client: 'sqlite3'
              }
            }
          )
        ).then(() => runTest('starts and shows the index page'));
      });

      it('sequelize', () => {
        const connectionString = 'sqlite://data.sqlite';

        return runConnectionGenerator({
          database: 'sqlite',
          adapter: 'sequelize',
          connectionString
        }).then(() =>
          assert.jsonFileContent(
            path.join(appDir, 'config', 'default.json'), {
              sqlite: connectionString
            }
          )
        ).then(() => runTest('starts and shows the index page'));
      });

      it('objection', () => {
        return runConnectionGenerator({
          database: 'sqlite',
          adapter: 'objection',
          connectionString: 'sqlite://data.sqlite'
        }).then(() =>
          assert.jsonFileContent(
            path.join(appDir, 'config', 'default.json'), {
              sqlite: {
                client: 'sqlite3',
                connection: {
                  filename: 'data.sqlite'
                }
              }
            }
          )
        ).then(() => runTest('starts and shows the index page'));
      });
    });

    it('rethinkdb', () => {
      return runConnectionGenerator({
        database: 'rethinkdb',
        connectionString: 'rethinkdb://localhost:11078/testing'
      }).then(() =>
        assert.jsonFileContent(
          path.join(appDir, 'config', 'default.json'), {
            rethinkdb: {
              db: 'testing',
              servers: [
                {
                  host: 'localhost',
                  port: 11078
                }
              ]
            }
          }
        )
      ).then(() => runTest('starts and shows the index page'));
    });

    it('cassandra', () => {
      return runConnectionGenerator({
        database: 'cassandra',
        adapter: 'cassandra',
        connectionString: 'cassandra://localhost:9042/test'
      }).then(() =>
        assert.jsonFileContent(
          path.join(appDir, 'config', 'default.json'), {
            cassandra: {
              clientOptions: {
                contactPoints: ['localhost'],
                protocolOptions: { port: 9042 },
                keyspace: 'test',
                queryOptions: { consistency: 1 }
              },
              ormOptions: {
                defaultReplicationStrategy: {
                  class: 'SimpleStrategy',
                  replication_factor: 1
                },
                migration: 'alter',
                createKeyspace: true
              }
            }
          }
        )
      ).then(() => runTest('starts and shows the index page'));
    });
  });

  describe('feathers:service', () => {
    function testServiceGenerator(adapter, database, id = null) {
      return helpers.run(path.join(__dirname, '..', 'generators', 'service'))
        .inTmpDir(() => process.chdir(appDir))
        .withPrompts({
          adapter,
          database,
          name: adapter,
          path: adapter
        })
        .withOptions({ skipInstall: false })
        .then(() => runTest(`'${adapter}' service`))
        .then(() => startAndWait('node', ['src/'], { cwd: appDir }, 'Feathers application started'))
        .then(delay(3000))
        .then(({ child }) => {
          const text = 'This is a test';
          const body = { text };

          if (database === 'cassandra') {
            body.id = 1;
          }

          return rp({
            url: `http://localhost:3030/${adapter}`,
            method: 'post',
            json: true,
            body
          }).then(response => {
            if(id) {
              assert.ok(typeof response[id] !== 'undefined');
            }

            assert.equal(response.text, text);
          }).then(() => child.kill())
            .catch(e =>
              new Promise((resolve, reject) => {
                child.once('exit', () => reject(e));
                child.kill('SIGKILL');
              })
            );
        });
    }

    it('generic', () => testServiceGenerator('generic'));
    it('memory', () => testServiceGenerator('memory', null, 'id'));
    it('nedb', () => testServiceGenerator('nedb', null, '_id'));
    it('mongodb', () => testServiceGenerator('mongodb', 'mongodb', '_id'));
    it('mongoose', () => testServiceGenerator('mongoose', 'mongodb', '_id'));
    it('knex', () => testServiceGenerator('knex', 'sqlite', 'id'));
    it('sequelize', () => testServiceGenerator('sequelize', 'sqlite', 'id'));
    it('objection', () => testServiceGenerator('objection', 'sqlite', 'id'));
    it('cassandra', () => testServiceGenerator('cassandra', 'cassandra', 'id'));
    it.skip('rethinkdb', () => testServiceGenerator('rethinkdb', 'id'));
  });

  describe('feathers:authentication', () => {
    it.skip('runs and initializes working local strategy', () => {
      return helpers
        .run(path.join(__dirname, '../generators/authentication'))
        .withPrompts({
          strategies: ['local'],
          entity: 'users',
          database: 'memory'
        })
        .withOptions({ skipInstall: false })
        .then(() => startAndWait('node', ['src/'], { cwd: appDir }, 'Feathers application started'))
        .then(delay(1000));
    });
  });
});
