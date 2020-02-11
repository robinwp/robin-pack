const babel = require('@babel/core');

function babelLoader (source) {
  const { code } = babel.transform(source, {
    presets: ['@babel/preset-env']
  });
  return code;
}

module.exports = babelLoader;

