const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/main.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|wav|mp3|ogg)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "assets", to: "assets" }
      ],
    }),
  ],
  devServer: {
    static: [
      {
        directory: path.join(__dirname, "assets"),
        publicPath: "/assets",
      },
      {
        directory: path.join(__dirname, "dist"),
        publicPath: "/",
      }
    ],
    port: 3001,
    hot: true,
  },
};
