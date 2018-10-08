var path = require('path')
var webpack = require('webpack')
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')
var WrapperPlugin = require('wrapper-webpack-plugin')

module.exports = {
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'webaction.user.js'
  },
  optimization: {
     minimize: false
  },
  plugins: [
    new UglifyJsPlugin(),
    new WrapperPlugin({
      header: '// ==UserScript==\n' +
              '// @name Webaction extrair\n' +
              '// @namespace Scripts\n' +
              '// @match *://futabasha.pluginfree.com/*\n' +
              '// @grant none\n' +
              '// ==/UserScript==\n\n',
    }),
    new webpack.ProvidePlugin({
      Promise: ['es6-promise', 'Promise']
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: { appendTsSuffixTo: [/\.vue$/] }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.ts', '.js', '.json']
  },
  performance: {
    hints: false
  },
}