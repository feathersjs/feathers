var recast = require('recast');
var traverse = require('ast-traverse');

var parse = exports.parse = function(code) {
  return recast.parse(code);
};

var convert = exports.convert = function(ast) {
  if(typeof ast === 'string') {
    return recast.parse(ast);
  }
  
  return ast;
};

var insert = exports.insert = function(target, nodes, index) {
  target.splice.apply(target, [index || 0, 0].concat(nodes));
  
  return target;
};

var createImport = exports.createImport = function(varname, modulename) {
  return parse('const ' + varname + ' = require(\'' + modulename + '\');\n').program.body;
};

var findFirstNodeAfter = exports.findFirstNodeAfter = function(ast, code, type) {
  var next = false;
  var result = null;
  
  traverse(ast, {
    pre: function(node) {
      if(recast.print(node).code === code) {
        next = true;
      }
    },
    
    post: function(node) {
      if(!result && next && (!type || node.type === type)) {
        next = false;
        result = node;
      }
    }
  });
  
  return result;
};

exports.print = function(ast) {
  return recast.print(ast).code;
};

exports.addToArrayInObject = function(ast, objectCode, key, code) {
  ast = convert(ast);
  
  var objectAst = findFirstNodeAfter(ast, objectCode, 'ObjectExpression');
  var ran = false;
  
  if(objectAst === null) {
    throw new Error('Could not find any object ' + objectCode);
  }
  
  traverse(objectAst, {
    pre: function(node, parent) {
      if(node.type === 'ArrayExpression' && parent.key.name === key) {
        insert(node.elements, parse(code).program.body, node.elements.length);
        ran = true;
      }
    }
  });
  
  if(!ran) {
    throw new Error('Could not find an array for object key ' + key + ' to inser ' + code);
  }
  
  return ast;
};

exports.addImport = function(ast, varname, modulename) {
  ast = convert(ast);
  
  var index = 0;
  var nodes = ast.program.body;
  
  if(nodes[0].expression && nodes[0].expression.raw.indexOf('use strict') !== -1) {
    index = 1;
  }
  
  insert(nodes, createImport(varname, modulename), index);
  
  return ast;
};
