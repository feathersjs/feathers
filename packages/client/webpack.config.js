const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

function createConfig (name, isProduction = false) {
  const output = name === 'index' ? 'feathers' : name;
  const commons = {
    entry: `./src/${name}.js`,
    output: {
      library: 'feathers',
      libraryTarget: 'umd',
      globalObject: 'this',
      path: path.resolve(__dirname, 'dist'),
      filename: `${output}.js`
    },
    module: {
      rules: [{
        test: /\.js/,
        exclude: /node_modules\/(?!(@feathersjs|debug))/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
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
      new UglifyJSPlugin({
        uglifyOptions: {
          ie8: false,
          comments: false,
          sourceMap: false
        }
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
  };

  return merge(commons, isProduction ? production : dev);
}

module.exports = [
  createConfig('index'),
  createConfig('index', true),
  createConfig('core'),
  createConfig('core', true),
  createConfig('rest'),
  createConfig('rest', true),
  createConfig('socketio'),
  createConfig('socketio', true),
  createConfig('primus'),
  createConfig('primus', true),
  createConfig('authentication'),
  createConfig('authentication', true)
];
