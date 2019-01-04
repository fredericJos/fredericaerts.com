const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: [
      './src/js/index.js',
    ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/views/components'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env'],
          },
        },
      },
      {
        test: /\.ejs$/,
        loader: 'ejs-loader'
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['public']),
    new webpack.ProvidePlugin({
      _: 'lodash',
    }),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/views/index.ejs',
    }),
    new HtmlWebpackPlugin({
      filename: 'archive/index.html',
      template: 'src/views/pages/archive.ejs',
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/meta',
        to: '',
      },
      {
        from: 'src/img',
        to: 'img',
      },
    ]),
  ],
  optimization: {
    minimizer: [new UglifyJSPlugin()]
  }
};
