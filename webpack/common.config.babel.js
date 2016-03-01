import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import jeet from 'jeet';
import rupture from 'rupture';
import nib from 'nib';
import _svgStylus from 'svg-stylus/svg';
import rework from 'rework';

function svgStylus(options) {
  return function callback() {
    this.on('end', (err, css) => {
      const cssObj = rework(css);
      cssObj.use(_svgStylus(options));

      return cssObj.toString();
    });
  };
};

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
    home: "./app/pages/home/index.js",
    kvdEditor: "./app/pages/kvd-editor/index.js",
    debug: "./app/pages/debug/index.js",
    logicEditor: "./app/pages/logic-editor/index.js",
    ledEditor: "./app/pages/led-editor/index.js",
    fsmEditor: "./app/pages/fsm-editor/index.js",
    numberCircle: "./app/pages/number-circle/index.js",
    vendor: require("../app/vendor.js"),
  },

  output: {
    path: "./build",
    filename: "[name]-[hash].js",
    pathinfo: true,
    publicPath: "",
  },

  module: {
    preLoaders: [
      {test: /\.js$/, loader: "eslint-loader", exclude: vendorModules},
    ],
    loaders: [
      {
        test: /\.pegjs$/,
        loader: 'babel!pegjs-loader',
      },
      {
        test: /\.(json)$/,
        loader: "json",
      },
      {
        test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
        loader: 'url?name=[path][name].[ext]',
      },
      {
        test: /\.js$/,
        exclude: vendorModules,
        loader: "babel",
        query: {
          plugins: ['transform-function-bind'],
        },
      },
    ],
  },

  stylus: {
    use: [svgStylus('./app'), jeet(), rupture(), nib()],
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin(
      'vendor', 'vendor-[hash].js', Infinity
    ),
    new ExtractTextPlugin('[name]-[contenthash].css', {allChunks: true}),
    new HtmlWebpackPlugin({
      title: 'Home',
      minify: htmlMinifyOptions,
      chunks: ['home', 'vendor'],
      template: './app/index.html',
      filename: 'index.html',
      favicon: './app/pages/home/home.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'KV Diagram Editor',
      minify: htmlMinifyOptions,
      chunks: ['kvdEditor', 'vendor'],
      template: './app/index.html',
      filename: 'kvd-editor.html',
      favicon: './app/pages/kvd-editor/kvd.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Logic Editor',
      minify: htmlMinifyOptions,
      chunks: ['logicEditor', 'vendor'],
      template: './app/index.html',
      filename: 'logic-editor.html',
      favicon: './app/pages/logic-editor/logic.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'LED Editor',
      minify: htmlMinifyOptions,
      chunks: ['ledEditor', 'vendor'],
      template: './app/index.html',
      filename: 'led-editor.html',
      favicon: './app/pages/led-editor/led.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'FSM Editor',
      minify: htmlMinifyOptions,
      chunks: ['fsmEditor', 'vendor'],
      template: './app/index.html',
      filename: 'fsm-editor.html',
      favicon: './app/pages/fsm-editor/fsm.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Number circle',
      minify: htmlMinifyOptions,
      chunks: ['numberCircle', 'vendor'],
      template: './app/index.html',
      filename: 'number-circle.html',
      favicon: './app/pages/number-circle/number-circle.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Debug',
      minify: htmlMinifyOptions,
      chunks: ['debug', 'vendor'],
      template: './app/index.html',
      filename: 'debug.html',
      favicon: './app/pages/debug/debug.ico',
    }),
    new CopyWebpackPlugin([
      {from: 'app/static'},
    ]),
  ],
  node: {
    fs: 'empty',
  },
};
