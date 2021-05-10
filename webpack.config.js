const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DEST = path.join(ROOT, 'dist');

module.exports = {
  context: SRC,
  entry: {
    build: path.join(SRC, 'index.ts'),
    heightmap: path.join(ROOT, 'tools', 'heightmap', 'index.ts'),
  },
  output: {
    path: DEST,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss', 'fx'],
    modules: [
      ROOT,
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
      from: path.join(ROOT, 'tools/heightmap/index.html'),
      to: DEST + '/heightmap.html',
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
