module.exports = function (__require__, entryId, modules) {
  const modulesTemp = Object.keys(modules).map((item) => {
    return `${ JSON.stringify(item) }: (function(module, exports, ${ __require__ }) {
        eval(${ JSON.stringify(modules[item]) });
      })`;
  }).join(',\r\n');


  return `(function(modules) {
  // The module cache
  var installedModules = {};
  // The require function
  function ${ __require__ }(moduleId) {
    // Check if module is in cache
    if(installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    // Create a new module (and put it into the cache)
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    // Execute the module function
    modules[moduleId].call(module.exports, module, module.exports, ${ __require__ });
    // Flag the module as loaded
    module.l = true;
    // Return the exports of the module
    return module.exports;
  }
  // Load entry module and return exports
  // ${ __require__ }.s = 
  return ${ __require__ }(${ JSON.stringify(entryId) });
})
({
  ${ modulesTemp }
});`;
};
