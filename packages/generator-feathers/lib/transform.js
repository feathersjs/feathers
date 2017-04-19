const j = require('@feathersjs/jscodeshift');

j.registerMethods({
  findDeclaration(name) {
    return this.findVariableDeclarators(name)
      .closest(j.VariableDeclaration);
  },
  
  findIdentifier(name) {
    const result = this.find(j.Identifier);

    if(name) {
      return result.filter(i => i.value.name === name);
    }

    return result;
  },

  insertHook(type, method, name) {
    let current = this.findIdentifier(type).closest(j.Property);

    if(!current.length) {
      throw new Error(`No hook declaration object for '${type}' hooks found.`);
    }
    
    current = current.findIdentifier(method).closest(j.Property);

    if(!current.length) {
      throw new Error(`No method declaration object for hook type '${type}' and method '${method}' found.`);
    } 

    current.find(j.ArrayExpression)
      .forEach(prop =>
        prop.value.elements.push(j.callExpression(j.identifier(name), []))
      );
    
    return this;
  },

  findExpressionStatement(identifier, name = '') {
    let result = this.findIdentifier(identifier)
      .closest(j.ExpressionStatement);

    if (name) {
      result = result.findIdentifier(name)
        .closest(j.ExpressionStatement);
    }

    return result;
  },

  findConfigure(name = '') {
    return this.findExpressionStatement('configure', name);
  },

  last() {
    if (this.length === 0) {
      return this;
    }

    return this.at(this.length - 1);
  },

  findModuleExports() {
    return this.filter(node => node.value.name === 'exports')
      .closest(j.ExpressionStatement);
  }
});

module.exports = j;
