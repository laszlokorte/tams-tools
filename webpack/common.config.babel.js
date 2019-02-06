import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';
import path from 'path';

const vendorModules = /(node_modules|bower_components)/;

const htmlMinifyOptions = process.env.NODE_ENV === 'production' ? {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  conservativeCollapse: false,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeRedundantAttributes: true,
  preventAttributesEscaping: true,
  useShortDoctype: true,
  removeEmptyAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
} : false;

//export default
module.exports = {
  target: "web",
  entry: {
    home: path.resolve(__dirname, "../app/pages/home/index.js"),
    kvdEditor: path.resolve(__dirname, "../app/pages/kvd-editor/index.js"),
    logicEditor: path.resolve(__dirname, "../app/pages/logic-editor/index.js"),
    ledEditor: path.resolve(__dirname, "../app/pages/led-editor/index.js"),
    fsmEditor: path.resolve(__dirname, "../app/pages/fsm-editor/index.js"),
    numberCircle: path.resolve(__dirname, "../app/pages/number-circle/index.js"),
    logicChecker: path.resolve(__dirname, "../app/pages/logic-checker/index.js"),
  },

  output: {
    path: path.resolve(__dirname, '../build/'),
    filename: "[name]-[hash].js",
    pathinfo: true,
    publicPath: "",
  },

  module: {
    rules: [
      {
        test: /\.pegjs$/,
        use: [{
          loader: 'babel-loader'
        }, {
          loader: 'pegjs-loader'
        }],
      },
      {
        test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
        use: [{
          loader: 'url-loader',

          options: {
            name: '[path][name]-[hash].[ext]'
          }
        }],
      },
      {
        test: /\.js$/,
        exclude: vendorModules,
        use: [{
          loader: 'babel-loader'
        }],
      },
      {
        test: /\.js$/,

        use: [{
          loader: 'eslint-loader'
        }],

        exclude: vendorModules,
        enforce: 'pre'
      },
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'Home',
      minify: htmlMinifyOptions,
      chunks: ['vendors', 'home'],
      template: './app/index.html',
      filename: 'index.html',
      favicon: './app/pages/home/home.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Karnaugh map editor',
      minify: htmlMinifyOptions,
      chunks: ['vendors', 'kvdEditor'],
      template: './app/index.html',
      filename: 'kvd-editor.html',
      favicon: './app/pages/kvd-editor/kvd.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Logic editor',
      minify: htmlMinifyOptions,
      chunks: ['vendors', 'logicEditor'],
      template: './app/index.html',
      filename: 'logic-editor.html',
      favicon: './app/pages/logic-editor/logic.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'LED editor',
      minify: htmlMinifyOptions,
      chunks: ['vendors', 'ledEditor'],
      template: './app/index.html',
      filename: 'led-editor.html',
      favicon: './app/pages/led-editor/led.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'FSM editor',
      minify: htmlMinifyOptions,
      chunks: ['vendors', 'fsmEditor'],
      template: './app/index.html',
      filename: 'fsm-editor.html',
      favicon: './app/pages/fsm-editor/fsm.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Number circle',
      minify: htmlMinifyOptions,
      chunks: ['vendors', 'numberCircle'],
      template: './app/index.html',
      filename: 'number-circle.html',
      favicon: './app/pages/number-circle/number-circle.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Logic checker',
      minify: htmlMinifyOptions,
      chunks: ['vendors', 'logicChecker'],
      template: './app/index.html',
      filename: 'logic-checker.html',
      favicon: './app/pages/logic-checker/logic-checker.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Debug',
      minify: htmlMinifyOptions,
      chunks: ['vendors', 'debug'],
      template: './app/index.html',
      filename: 'debug.html',
      favicon: './app/pages/debug/debug.ico',
    }),
    new CopyWebpackPlugin([
      {from: 'app/static'},
    ]),
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  node: {
    fs: 'empty',
  },
};
