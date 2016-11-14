export default function getBaseUrl (app, path) {
  const env = app.get('env');
  const protocol = (env === 'development' || env === 'test') ? 'http' : 'https';
  const host = app.get('host') || 'localhost';
  const port = (env === 'development' || env === 'test') ? `:${app.get('port') || process.env.PORT}` : '';

  path = path || '';
  // strip any leading a trailing slashes
  path = path.replace(/^\/|\/$/g, '');

  return `${protocol}://${host}${port}/${path}`;
}
