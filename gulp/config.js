var path = require('path');
var webpack = require('webpack');
var root = path.resolve(__dirname, '..');
var dest = path.resolve(__dirname, '..', 'build');
var assets = path.resolve(__dirname, '..', 'assets');
var content = path.resolve(__dirname, '..', 'content');
var p = require(path.resolve(__dirname, '..', 'package.json'));
var meta = require(path.resolve(__dirname, '..', 'config', (process.env.NODE_ENV || 'development') + '.json'));

module.exports = {
  clean: {
    src: dest + '/**/*'
  },
  copy: {
    src: [
      assets + '/robots.txt',
      assets + '/CNAME'
    ],
    dest: dest + '/'
  },
  sitemap: {
    src: dest + '/**/*.html',
    dest: dest + '/',
    sitemap: {
      siteUrl: 'http://feathersjs.com'
    }
  },
  deploy: {
    src: dest + '/**/*',
    ghpages: {
      force: true
    }
  },
  less: {
    src: assets + '/less',
    dest: dest + '/',
    entry: 'feathers.less'
  },
  fonts: {
    src: assets + '/fonts/**/*',
    dest: dest + '/fonts'
  },
  images: {
    src: assets + '/img/**/*',
    dest: dest + '/img/'
  },
  scripts: {
    src: [
      assets + '/js/**/*'
    ]
  },
  pages: {
    src: content + '/**/*',
    dest: dest,
    meta: meta,
    swig: {
      layoutPath: assets + '/layouts/',
      defaultLayout: 'layout',
      extension: '.html'
    },
    frontMatter: {
      property: 'page',
      remove: true
    },
    markdown: {
      // smartypants: true,
      highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
      }
    }
  },
  webpack: {
    src: '',
    dest: dest,
    entry: {
      feathers: assets + '/js/index'
    },
    output: {
      filename: '[name].js',
    },
    target: 'web',
    resolve: {
      extensions: ['', '.js'],
      modulesDirectories: ['node_modules']
    },
    externals: {
      // These modules are required natively by atom-shell
      // and therefore should not be bundled by webpack.
      // https://github.com/webpack/webpack/issues/516
    },
    module: {
      loaders: [
        // {
        //   // Tell webpack to use jsx-loader for all *.jsx files
        //   test: /\.jsx$/,
        //   loader: "jsx-loader"
        // },
        {
          // Exposes jQuery and $ to the window object. This does not automatically load the jquery module.
          test: /jquery\.js$/,
          loader: "expose?jQuery!expose?$"
        }
      ]
    },
    resolve: {
      alias: {
        velocity: 'velocity-animate'
      }
    },
    plugins: [
      // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.js'),
      // new webpack.optimize.UglifyJsPlugin()
    ]
  },
};