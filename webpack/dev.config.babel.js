import merge from 'webpack-merge';

import commonConfig from './common.config.babel.js';

//export default
module.exports = merge(commonConfig, {
  debug: true,
  devtool: "cheap-module-inline-source-map",
  profile: false,

  watch: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },

  module: {
    loaders: [
      {
        test: /\.styl$/,
        loader: "style-loader!css-loader?-autoprefixer" +
                "!stylus-loader?resolve url",
      },
    ],
  },

  // plugins: [
    // hot reloading is enabled via command line argument --hot
    // (see package.json)
    // new webpack.HotModuleReplacementPlugin(),
  // ],

  devServer: {
    outputPath: "./build",

    contentBase: "./app/static",
    port: 3000,

    // has to be passed as command line argument --inline
    // (see package.json)
    // inline: true,

    // (see package.json)
    // hot: true,

    historyApiFallback: true,

    colors: true,
    stats: 'normal',
  },
});
