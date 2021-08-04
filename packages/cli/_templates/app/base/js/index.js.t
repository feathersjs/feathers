---
to: "<%= h.lib %>/index.js"
---
import { app } from './app.js';
import { logger } from './logger.js';

const port = app.get('port');
const host = app.get('host');

app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`);
});
