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
  return function callback(style) {
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
    app: "./app/index.js",
    debug: "./app/debug.js",
    layout: "./app/layout.js",
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
      title: 'KV Diagram Editor',
      minify: htmlMinifyOptions,
      chunks: ['app', 'vendor'],
      template: './app/index.html',
      favicon: './app/favicon.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Debug',
      minify: htmlMinifyOptions,
      chunks: ['debug', 'vendor'],
      template: './app/index.html',
      filename: 'debug.html',
      favicon: './app/favicon.ico',
    }),
    new HtmlWebpackPlugin({
      title: 'Layout',
      minify: htmlMinifyOptions,
      chunks: ['layout', 'vendor'],
      template: './app/index.html',
      filename: 'layout.html',
      favicon: './app/favicon.ico',
    }),
    new CopyWebpackPlugin([
      {from: 'app/static'},
    ]),
  ],
};
