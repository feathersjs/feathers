const fs = require('fs');
const path = require('path');

const name = 'events/events.js';
const file = require.resolve(name);
const result = `// DO NOT MODIFY - generated from node_modules/events/events.js
const module = {};
${fs.readFileSync(file).toString()}
export { EventEmitter };`;

fs.writeFileSync(path.join(__dirname, '..', `_${name}`), result);
