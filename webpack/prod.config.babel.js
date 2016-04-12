import merge from 'webpack-merge';

import path from 'path';
import webpack from 'webpack';
import CompressionPlugin from 'compression-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanPlugin from 'clean-webpack-plugin';

import commonConfig from './common.config.babel.js';

//export default
module.exports = merge(commonConfig, {
  debug: false,
  devtool: "source-map",
  profile: true,
  watch: false,

  module: {
    loaders: [
      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract(
          "stylus", "css-loader?-autoprefixer!stylus-loader"
        ),
      },
    ],
  },

  plugins: [
    new CleanPlugin(['build'], {root: path.resolve(__dirname, '../')}),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        BROWSER: JSON.stringify(true),
      },
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      comments: /\@license|\@preserv/gi,
    }),
    new CompressionPlugin({
      asset: "{file}.gz",
      algorithm: "gzip",
      regExp: new RegExp("\.(js|html|svg)$"),
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
});
