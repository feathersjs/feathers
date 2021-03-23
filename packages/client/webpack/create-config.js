const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

module.exports = function createConfig (output, isProduction = false) {
  const commons = {
    entry: [
      `./src/${output}.ts`
    ],
    output: {
      library: 'feathers',
      libraryTarget: 'umd',
      globalObject: 'this',
      path: path.resolve(__dirname, '..', 'dist'),
      filename: `${output}.js`
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }, {
        test: /\.js/,
        exclude: /node_modules\/(?!(@feathersjs|debug))/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
          // plugins: ['@babel/plugin-transform-classes']
        }
      }]
    }
  };

  const dev = {
    mode: 'development',
    devtool: 'source-map'
  };
  const production = {
    mode: 'production',
    output: {
      filename: `${output}.min.js`
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
  };

  return merge(commons, isProduction ? production : dev);
}
