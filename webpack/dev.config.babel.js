import merge from 'webpack-merge';
import nib from 'nib';

import commonConfig from './common.config.babel.js';

//export default
module.exports = merge(commonConfig, {
  devtool: "cheap-module-inline-source-map",
  profile: false,
  mode: "development",
  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },

  module: {
    rules: [
      {
        test: /\.styl$/,
        use: [
          {
            loader:"style-loader",
          },
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

  // plugins: [
    // hot reloading is enabled via command line argument --hot
    // (see package.json)
    // new webpack.HotModuleReplacementPlugin(),
  // ],

  devServer: {
    contentBase: "./app/static",
    port: 3000,

    // has to be passed as command line argument --inline
    // (see package.json)
    // inline: true,

    // (see package.json)
    // hot: true,

    historyApiFallback: true,

    stats: 'normal',
  },
});
