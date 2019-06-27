/* tslint:disable:no-console */

let count = 0;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  count++;
});

process.on('exit', (code) => {
  if (count !== 0) {
    console.error(`Total count of unhandled rejections: ${count}`);
    process.exitCode = code || 1;
  }
});
