const path = require('path');
const fs = require('fs');
const parser = require('@babel/parser');
const t = require('@babel/types');
const generator = require('@babel/generator').default;

// https://astexplorer.net/
const traverse = require('@babel/traverse').default;
const template = require('./template');

const { SyncHook } = require('./tapable');
// https://github.com/webpack/tapable
/*
 * const {
 SyncHook,
 SyncBailHook,
 SyncWaterfallHook,
 SyncLoopHook,
 AsyncParallelHook,
 AsyncParallelBailHook,
 AsyncSeriesHook,
 AsyncSeriesBailHook,
 AsyncSeriesWaterfallHook
 } = require("tapable");
 *
 * */


const fsExtra = require('fs-extra');
const requireName = '__robin_pack_require__';

class Compiler {
  constructor(config) {
    this.config = config;
    this.modules = {};
    this.entryId = '';
    this.root = process.cwd();
    const nodeModulesPath = path.resolve(this.root, 'node_modules');
    if (fsExtra.pathExistsSync(nodeModulesPath)) {
      this.nodeModules = fs.readdirSync(nodeModulesPath);
    } else {
      this.nodeModules = [];
    }
    this.hooks = {
      init: new SyncHook(),
      end: new SyncHook(),
    };
    const plugins = this.config.plugins;
    if (Array.isArray(plugins)) {
      plugins.forEach(item => {
        item.apply(this);
      });
    }
    this.hooks.init.call();
  }


  buildMoudle(modulePath, isEntry) {
    // console.log(modulePath);
    let source = fs.readFileSync(path.resolve(this.root, modulePath), 'utf8');
    if (isEntry) {
      this.entryId = modulePath;
    }
    this.modules[modulePath] = 1;
    const rule = this.config.module.rules.find(item => item.test.test(modulePath));
    if (rule) {
      const { use } = rule;
      let len = use.length - 1;
      const loader = () => {
        if (len >= 0) {
          source = require(use[len--])(source);
          loader();
        }
      };
      loader();
    }
    const { sourceCode, dependencies } = this.parse(source, path.dirname(modulePath));
    dependencies.forEach((item) => {
      if (!this.modules[item]) this.buildMoudle(item, false);
    });
    this.modules[modulePath] = sourceCode;
  }

  parse(source, parentPath) {
    const ast = parser.parse(source);
    const dependencies = [];
    traverse(ast, {
      CallExpression: ({ node }) => {
        if (node.callee.name === 'require') {
          node.callee.name = requireName;
          let moduleName = node.arguments[0].value;
          const nodeModule = this.nodeModules.findIndex(item => item === moduleName);
          if (nodeModule !== -1) {
            const pageInfo = fsExtra.readJSONSync(path.join(this.root, 'node_modules', moduleName, 'package.json'));
            moduleName = './' + path.join('node_modules', moduleName, pageInfo.main);
          } else {
            moduleName += path.extname(moduleName) ? '' : '.js';
            moduleName = './' + path.join(parentPath, moduleName);
          }
          dependencies.push(moduleName);
          node.arguments = [t.stringLiteral(moduleName)];
        }
      },
    });
    return {
      sourceCode: generator(ast).code,
      dependencies,
    };
  }

  run() {
    this.buildMoudle(this.config.entry, true);
    this.emitFile();
  }

  emitFile() {
    const content = template(requireName, this.entryId, this.modules);
    const writePath = path.join(this.config.output.path, this.config.output.filename);
    if (!fsExtra.pathExistsSync(this.config.output.path)) {
      fsExtra.mkdirsSync(this.config.output.path);
    }
    fs.writeFileSync(writePath, content);
    this.hooks.end.call();
  }
}


module.exports = Compiler;
