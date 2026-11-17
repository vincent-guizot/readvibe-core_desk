const babel = require('@babel/core');
const vm = require('node:vm');

// Load one source module with explicit dependencies; never initialize the real DB.
module.exports = function loadModule(filename, imports = {}, globals = {}) {
  const { code } = babel.transformFileSync(filename, {
    babelrc: false,
    configFile: false,
    presets: [[require.resolve('@babel/preset-env'), { targets: { node: 'current' } }]],
  });
  const exports = {};
  vm.runInNewContext(code, {
    ...globals,
    exports,
    require(name) {
      if (!Object.hasOwn(imports, name)) throw new Error(`Missing test dependency: ${name}`);
      return imports[name];
    },
  }, { filename });
  return exports;
};
