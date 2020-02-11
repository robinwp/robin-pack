const path = require('path');
const clearPlugin = require('./plugin/clear');
const HtmlPlugin = require('./plugin/html');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './dist'),
  },
  plugins: [
    new clearPlugin(path.resolve(__dirname, './dist')),
    new HtmlPlugin(path.resolve(__dirname, './index.html')),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          path.resolve(__dirname, 'loader/babel.js'),
        ],
      },
      {
        test: /\.css$/,
        use: [
          path.resolve(__dirname, 'loader/style.js'),
        ],
      },
    ],
  },
};
