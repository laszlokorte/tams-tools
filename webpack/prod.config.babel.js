const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
import merge from 'webpack-merge';
import nib from 'nib';

import path from 'path';
import webpack from 'webpack';
import CompressionPlugin from 'compression-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CleanPlugin from 'clean-webpack-plugin';

import commonConfig from './common.config.babel.js';

//export default
module.exports = merge(commonConfig, {
  devtool: "source-map",
  profile: true,
  watch: false,
  mode: "production",
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader:"css-loader",
            //"!?-autoprefixer"
          },
          {
            loader:"stylus-loader",
            options: {
              use: [nib()],
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new CleanPlugin(['build'], {root: path.resolve(__dirname, '../')}),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        BROWSER: JSON.stringify(true),
      },
    }),
    new CompressionPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: new RegExp("\.(js|html|svg)$"),
      threshold: 10240,
      minRatio: 0.8,
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ],

  optimization: {
    minimize: true,

    minimizer: [new UglifyJsPlugin()],
  },
});
