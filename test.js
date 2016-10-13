var exec = require('child_process').exec;

if (process.version[1] >= 4) {
  console.log('> semistandard --fix');
  exec('semistandard --fix', function (error, stdout) {
    if (error) {
      console.log(error);
      process.exit(1);
    }
    if (stdout) {
      console.log(stdout);
    }
    process.exit(0);
  });
} else {
  process.exit(0);
}
