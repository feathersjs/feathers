// A build script that converts the incompatible
// TypeScript/Deno module references
const path = require('path');
const fs = require('fs');

const [,,packageName] = process.argv;
const excludes = [ 'dependencies.ts' ];
const listFiles = (folder, base = '') => {
  const files = fs.readdirSync(folder);

  return files.reduce((result, current) => {
    const fullName = path.join(folder, current);
    if (fs.lstatSync(fullName).isDirectory()) {
      result.push(...listFiles(fullName, path.join(base, current)));
    } else if (!excludes.includes(current) && path.extname(current) === '.ts') {
      result.push(path.join(base, current));
    }

    return result;
  }, []);
}

const folder = path.join(__dirname, '..', '..', 'packages', packageName, 'src');
const target = path.join(__dirname, '..', `_${packageName}`);
const files = listFiles(folder);
const existingFiles = listFiles(target);

existingFiles.forEach(fileName => {
  fs.unlinkSync(path.join(target, fileName));
});

files.forEach(fileName => {
  const parts = fileName.split('/');
  const fullName = path.join(folder, fileName);
  const content = fs.readFileSync(fullName).toString();
  const transformed = content
    .replace(/from '(\..*)'/g, 'from \'$1.ts\'')
    .replace(/if \(typeof module !== 'undefined'\) {.*}/gms, '');
  const result = `// DO NOT MODIFY - generated from packages/${packageName}/src/${fileName}\n\n${transformed}`;

  // Creates all sub-folders
  parts.pop();

  if (parts.length) {
    let currentPath = target;
    for (part of parts) {
      currentPath = path.join(currentPath, part);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
    }
  }

  const targetName = fileName === 'index.ts' ? 'mod.ts' : fileName;

  fs.writeFileSync(path.join(target, targetName), result);
});
