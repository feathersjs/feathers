module.exports = {
  entry: './test.js',
  output: {
    filename: './test.dist.js'
  },
  module: {
    rules: [{
      test: /\.js/,
      exclude: /node_modules\/(?!(@feathersjs))/,
      loader: 'babel-loader'
    }]
  }
};
