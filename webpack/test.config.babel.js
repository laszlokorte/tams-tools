import glob from 'glob';

const vendorModules = /(node_modules|bower_components)/;

module.exports = {
  watch: true,
  devtool: 'eval-source-map',

  entry: {
    test: glob.sync("./app/**/__test__/*.spec.js"),
  },

  output: {
    path: './build',
    filename: '[name].js',
  },

  module: {
    preLoaders: [
      {test: /\.js$/, loader: "eslint-loader", exclude: vendorModules},
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: vendorModules,
        loader: "babel",
      },
    ],
  },
  node: {
    fs: 'empty',
  },
};
