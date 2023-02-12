const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerPlugin = require('fork-ts-checker-webpack-plugin');

const SRC = path.join(__dirname, 'src');
const DEST = path.join(__dirname, 'dist');
const TOOLDIR = path.join(__dirname, 'tools');
const tools = require('fs').readdirSync(TOOLDIR);

module.exports = {
  context: __dirname,
  entry: {
    build: path.join(SRC, 'index.ts'),
    ...tools.reduce((obj, toolName) => {
      obj[toolName] = path.join(TOOLDIR, toolName, 'index.ts');
      return obj;
    }, {}),
  },
  output: {
    path: DEST,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss', 'fx'],
    modules: [
      __dirname,
      path.join('node_modules'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true
        }
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
    ...tools.map(toolName => {
      return new CopyPlugin([{
        from: path.join(TOOLDIR, toolName, 'index.html'),
        to: DEST + `/${toolName}.html`
      }]);
    }),
    new CopyPlugin([{
      from: path.join(__dirname, 'assets'),
      to: path.join(DEST),
    }]),
    new ForkTsCheckerPlugin(),
  ],
  devServer: {
    contentBase: DEST,
    compress: true,
    port: 9000
  }
}
