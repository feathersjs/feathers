const { snakeCase } = require('lodash');
const url = require('url');
const j = require('@feathersjs/tools').transform;
const Generator = require('../../lib/generator');

module.exports = class ConnectionGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.dependencies = [];
  }

  _transformCode (code) {
    const { adapter } = this.props;

    const ast = j(code);
    const appDeclaration = ast.findDeclaration('app');
    const configureMiddleware = ast.findConfigure('middleware');
    const requireCall = `const ${adapter} = require('./${adapter}');`;

    if (appDeclaration.length === 0) {
      throw new Error('Could not find \'app\' variable declaration in app.js to insert database configuration. Did you modify app.js?');
    }

    if (configureMiddleware.length === 0) {
      throw new Error('Could not find .configure(middleware) call in app.js after which to insert database configuration. Did you modify app.js?');
    }

    appDeclaration.insertBefore(requireCall);
    configureMiddleware.insertBefore(`app.configure(${adapter});`);

    return ast.toSource();
  }

  _getConfiguration () {
    const sqlPackages = {
      mysql: 'mysql2',
      mssql: 'mssql',
      postgres: 'pg',
      sqlite: 'sqlite3'
      // oracle: 'oracle'
    };

    const { connectionString, database, adapter } = this.props;
    let parsed = {};

    if (adapter === 'objection') {
      this.dependencies.push('knex');
    } else if (adapter === 'cassandra') {
      this.dependencies.push('express-cassandra');
      this.dependencies.push('cassanknex');
    }

    switch (database) {
    case 'nedb':
      this.dependencies.push('nedb');
      return connectionString.substring(7, connectionString.length);

    case 'rethinkdb':
      parsed = url.parse(connectionString);
      this.dependencies.push('rethinkdbdash');

      return {
        db: parsed.path.substring(1, parsed.path.length),
        servers: [
          {
            host: parsed.hostname,
            port: parsed.port
          }
        ]
      };

    case 'memory':
      return null;

    case 'mongodb':
      this.dependencies.push(adapter);
      return connectionString;

    case 'mysql':
    case 'mssql':
    // case oracle:
    case 'postgres': // eslint-disable-line no-fallthrough
    case 'sqlite':
      this.dependencies.push(adapter);

      if (sqlPackages[database]) {
        this.dependencies.push(sqlPackages[database]);
      }

      if (adapter === 'sequelize') {
        return connectionString;
      }

      return {
        client: sqlPackages[database],
        connection: (database === 'sqlite' && typeof connectionString === 'string') ? {
          filename: connectionString.substring(9, connectionString.length)
        } : connectionString
      };

    case 'cassandra':
      if (typeof connectionString !== 'string') {
        return connectionString;
      }

      parsed = url.parse(connectionString);

      return {
        clientOptions: {
          contactPoints: [parsed.hostname],
          protocolOptions: { port: Number(parsed.port) || 9042 },
          keyspace: parsed.path.substring(1, parsed.path.length),
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
      };

    default:
      throw new Error(`Invalid database '${database}'. Cannot assemble configuration.`);
    }
  }

  _writeConfiguration () {
    const { database } = this.props;
    const config = Object.assign({}, this.defaultConfig);
    const configuration = this._getConfiguration();

    if (!config[database]) {
      config[database] = configuration;

      this.conflicter.force = true;
      this.fs.writeJSON(
        this.destinationPath('config', 'default.json'),
        config
      );
    }
  }

  prompting () {
    this.checkPackage();

    const databaseName = snakeCase(this.pkg.name);
    const { defaultConfig } = this;

    const getProps = answers => Object.assign({}, this.props, answers);
    const setProps = props => Object.assign(this.props, props);

    const prompts = [
      {
        type: 'list',
        name: 'database',
        message: 'Which database are you connecting to?',
        default: 'nedb',
        choices: [
          { name: 'Memory', value: 'memory' },
          { name: 'MongoDB', value: 'mongodb' },
          { name: 'MySQL (MariaDB)', value: 'mysql' },
          { name: 'NeDB', value: 'nedb' },
          // { name: 'Oracle', value: 'oracle' },
          { name: 'PostgreSQL', value: 'postgres' },
          { name: 'RethinkDB', value: 'rethinkdb' },
          { name: 'SQLite', value: 'sqlite' },
          { name: 'SQL Server', value: 'mssql' },
          { name: 'Cassandra', value: 'cassandra' }
        ],
        when (current) {
          const answers = getProps(current);
          const { database, adapter } = answers;

          if (database) {
            return false;
          }

          switch (adapter) {
          case 'nedb':
          case 'rethinkdb':
          case 'memory':
          case 'mongodb':
          case 'cassandra':
            setProps({ database: adapter });
            return false;
          case 'mongoose':
            setProps({ database: 'mongodb' });
            return false;
          }

          return true;
        }
      },
      {
        type: 'list',
        name: 'adapter',
        message: 'Which database adapter would you like to use?',
        default (current) {
          const answers = getProps(current);
          const { database } = answers;

          if (database === 'mongodb') {
            return 'mongoose';
          }

          return 'sequelize';
        },
        choices (current) {
          const answers = getProps(current);
          const { database } = answers;
          const mongoOptions = [
            { name: 'MongoDB Native', value: 'mongodb' },
            { name: 'Mongoose', value: 'mongoose' }
          ];
          const sqlOptions = [
            { name: 'Sequelize', value: 'sequelize' },
            { name: 'KnexJS', value: 'knex' },
            { name: 'Objection', value: 'objection' }
          ];
          const cassandraOptions = [
            { name: 'Cassandra', value: 'cassandra' }
          ];

          if (database === 'mongodb') {
            return mongoOptions;
          }

          if (database === 'cassandra') {
            return cassandraOptions;
          }

          // It's an SQL DB
          return sqlOptions;
        },
        when (current) {
          const answers = getProps(current);
          const { database, adapter } = answers;

          if (adapter) {
            return false;
          }

          switch (database) {
          case 'nedb':
          case 'rethinkdb':
          case 'memory':
          case 'cassandra':
            return false;
          }

          return true;
        }
      },
      {
        name: 'connectionString',
        message: 'What is the database connection string?',
        default (current) {
          const answers = getProps(current);
          const { database } = answers;
          const defaultConnectionStrings = {
            mongodb: `mongodb://localhost:27017/${databaseName}`,
            mysql: `mysql://root:@localhost:3306/${databaseName}`,
            nedb: 'nedb://../data',
            // oracle: `oracle://root:password@localhost:1521/${databaseName}`,
            postgres: `postgres://postgres:@localhost:5432/${databaseName}`,
            rethinkdb: `rethinkdb://localhost:28015/${databaseName}`,
            sqlite: `sqlite://${databaseName}.sqlite`,
            mssql: `mssql://root:password@localhost:1433/${databaseName}`,
            cassandra: `cassandra://127.0.0.1:9042/${databaseName}`
          };

          return defaultConnectionStrings[database];
        },
        when (current) {
          const answers = getProps(current);
          const { database } = answers;
          const connection = defaultConfig[database];

          if (connection) {
            if (connection.connection){
              setProps({ connectionString:connection.connection });
            } else if (database === 'rethinkdb' && connection.db) {
              setProps({ connectionString:`rethinkdb://${connection.servers[0].host}:${connection.servers[0].port}/${connection.db}` });
            } else {
              setProps({ connectionString:connection });
            }
            return false;
          }

          return database !== 'memory';
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.props, props);
    });
  }

  writing () {
    let template;
    const { database, adapter } = this.props;
    const context = Object.assign({}, this.props);

    if (database === 'rethinkdb') {
      template = 'rethinkdb.js';
    } else if (database === 'mssql' && adapter === 'sequelize') {
      template = `${adapter}-mssql.js`;
    } else if (adapter && adapter !== 'nedb') {
      template = `${adapter}.js`;
    }

    if (template) {
      const dbFile = `${adapter}.js`;
      const templateExists = this.fs.exists(this.destinationPath(this.libDirectory, dbFile));

      // If the file doesn't exist yet, add it to the app.js
      if (!templateExists) {
        const appjs = this.destinationPath(this.libDirectory, 'app.js');

        this.conflicter.force = true;
        this.fs.write(appjs, this._transformCode(
          this.fs.read(appjs).toString()
        ));
      }

      // Copy template only if connection generate is not composed
      // from the service generator
      if(!templateExists || (templateExists && !this.props.service)) {
        this.fs.copyTpl(
          this.templatePath(template),
          this.destinationPath(this.libDirectory, dbFile),
          context
        );
      }
    }

    this._writeConfiguration();

    this._packagerInstall(this.dependencies, {
      save: true
    });
  }

  end () {
    const { database, connectionString } = this.props;

    // NOTE (EK): If this is the first time we set this up
    // show this nice message.
    if (connectionString && !this.defaultConfig[database]) {
      this.log();
      this.log(`Woot! We've set up your ${database} database connection!`);

      switch (database) {
      case 'mongodb':
      case 'mssql':
      case 'mysql':
      // case 'oracle':
      case 'postgres': // eslint-disable-line no-fallthrough
      case 'rethinkdb':
      case 'cassandra':
        this.log(`Make sure that your ${database} database is running, the username/role is correct, and "${connectionString}" is reachable and the database has been created.`);
        this.log('Your configuration can be found in the projects config/ folder.');
        break;
      }
    }
  }
};
