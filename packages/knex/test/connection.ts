export default (DB: string) => {
  if (DB === 'mysql') {
    return {
      client: 'mysql',
      connection: {
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'feathers_knex'
      }
    }
  }

  if (DB === 'postgres') {
    return {
      client: 'postgresql',
      connection: {
        host: 'localhost',
        database: 'postgres',
        user: 'postgres',
        password: ''
      }
    }
  }

  return {
    client: 'sqlite3',
    connection: {
      filename: './db.sqlite'
    }
  }
}
