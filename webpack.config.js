const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DEST = path.join(ROOT, 'dist');

module.exports = {
  context: SRC,
  entry: path.join(SRC, 'index.ts'),
  output: {
    path: DEST,
    filename: 'build.js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss', 'fx'],
    modules: [
      path.join(ROOT, 'src'),
      path.join('node_modules'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.fx$/,
        loader: 'webpack-glsl-loader'
      }
    ]
  },
  mode: "development",
  devtool: 'cheap-module-source-map',
  plugins: [
    new CopyPlugin([{
      from: path.join(SRC, 'index.html'),
      to: DEST,
    }]),
    new CopyPlugin([{
      from: path.join(ROOT, 'assets'),
      to: path.join(DEST),
    }]),
  ],
  devServer: {
    contentBase: DEST,
    compress: true,
    port: 9000
  }
}
