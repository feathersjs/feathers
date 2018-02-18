function preprocess(input) {
    const awaitMatcher = /^(?:\s*(?:(?:let|var|const)\s)?\s*([^=]+)=\s*|^\s*)?(await\s[\s\S]*)/;
    const asyncWrapper = (code, binder) => {
      let assign = binder ? `global.${binder} = ` : '';
      return `(function(){ async function _wrap() { return ${assign}${code} } return _wrap();})()`;
    };
  
    // match & transform
    const match = input.match(awaitMatcher);
    if (match) {
      input = `${asyncWrapper(match[2], match[1])}`;
    }
    return input;
}
  
const message = 'Feathers inteactive shell. Use `app` global to access application.'

module.exports = function () {
    const path = require('path');
    const cwd = process.cwd();
    const pkg = require(path.join(cwd, '/package.json'));
    const app = require(path.join(cwd, pkg.main, '/app'));
    const repl = require('repl');

    console.log(message)
    var myrepl=repl.start({prompt:'app> ', useGlobal:false});
    const _eval = myrepl.eval;
    myrepl.eval = (cmd, context, filename, callback) => {
        _eval(preprocess(cmd), context, filename, callback);
    };
    myrepl.context['app'] = app;
}
