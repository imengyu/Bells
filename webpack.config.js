const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const config = {
  entry: "./src/app.js",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "app.js"
  },
  target: 'electron-renderer',
  mode: 'development',
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      'assets': path.resolve(__dirname, '../src/assets'),
      'jquery': "jquery/src/jquery",
    }
  },
  module: {
    rules: [
      {
        test: /\.(ttf|woff|woff2|eot|otf|svg|node|bmp|png|jpg|jpeg|gif|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              outputPath: 'app/',
            }
          }
        ]
      },
      {
        test: /\.css$/, use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ]
      },
      { test: /\.ts$/, use: 'ts-loader' },
      {
        test: /\.(scss|sass)$/, use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ]
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'html-withimg-loader!./src/app.html',
      filename: 'index.html',
      minify: {
        minifyCSS: true,
        minifyJS: true,
        collapseWhitespace: true,
        removeComments: true
      }
    }),
  ]
};

module.exports = config