const path = require('path')

module.exports = {
  mode: 'production',
  entry: './public/scripts/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    splitChunks: {
      minSize: 10000,
      maxSize: 250000
    }
  },
  performance: {
    hints: false
  }
}
