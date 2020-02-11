const fsExtra = require('fs-extra');

class ClearPlugin {
  constructor (path) {
    this.path = path;
  }

  apply (compliance) {
    compliance.hooks.init.tap('ClearPlugin', () => {
      fsExtra.removeSync(this.path);
    });
  }
}

module.exports = ClearPlugin;
