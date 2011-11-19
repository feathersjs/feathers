var feathry = require('../lib/feathry'), Memory = require('../lib/resource.js').Memory;

feathry.handles(feathry.rest()).resource('test', new Memory()).start();
