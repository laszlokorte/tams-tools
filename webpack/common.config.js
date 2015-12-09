import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import jeet from 'jeet';
import rupture from 'rupture';
import nib from 'nib';

let name = 'Cycle!';

let vendorModules = /(node_modules|bower_components)/;

//export default
module.exports = {
  target: "web",
  entry: {
    app: "./app/index.js",
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
      // {
      //   test: /\.(json)$/,
      //   loader: "file?name=[path][name].[ext]&context=./app/static",
      // },
      {
        test: /\.js$/,
        exclude: vendorModules,
        loader: "babel",
        query: {
          env: {
            development: {
              plugins: [
                'typecheck',
              ],
            },
          },
          plugins: [
            'syntax-flow',
            'transform-flow-strip-types',
          ],
        },
      },
    ],
  },

  stylus: {
    use: [jeet(), rupture(), nib()],
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin(
      'vendor', 'vendor-[hash].js', Infinity
    ),
    new ExtractTextPlugin('app.css', {allChunks: true}),
    new HtmlWebpackPlugin({
      title: name,
      minify: process.env.NODE_ENV === 'production' ? {
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
      } : false,
      template: './app/index.html',
      favicon: './app/favicon.ico',
    }),
    new CopyWebpackPlugin([
      {from: 'app/static'},
    ]),
  ],
};
