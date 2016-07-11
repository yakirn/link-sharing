'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval-source-map',
  entry: path.join(__dirname, 'app/main.js'),
  output: {
    path: path.join(__dirname, '/public/'),
    filename: 'main.js'
//    publicPath: '/'
  },
  cache: true,
  devtool: 'eval-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: 'app/index.tpl.html',
      inject: 'body',
      filename: 'index.html'
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        "presets": ["es2015", "stage-0"]
      }
  }]
    // , {
    //   test: /\.json?$/,
    //   loader: 'json'
    // }, {
    //   test: /\.css$/,
    //   loader: 'style!css?modules&localIdentName=[name]---[local]---[hash:base64:5]'
    // }]
  }
};
