const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const StylelintPlugin = require("stylelint-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const resourceFolder = "../../build/resources/main/assets/";

module.exports = {
  entry: {
    main: "./scripts/main.es6",
    admintool: ["./styles/admintool.scss"]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css"
    }),
    new StylelintPlugin({
      context: "./styles/"
    })
  ],
  module: {
    rules: [
      {
        test: /bootstrap\.native/,
        use: {
          loader: "bootstrap.native-loader",
          options: {
            only: ["collapse"]
          }
        }
      },
      {
        test: /\.(js|es6)?$/,
        use: "babel-loader",
        exclude: /node_modules/,
        include: [
          path.resolve(__dirname, "./scripts")
        ]
      },
      {
        test: /\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "resolve-url-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name][ext]"
        }
      },
      {
        test: /\.(svg|gif|png|jp?g|webp)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]"
        },
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    "imagemin-gifsicle",
                    "imagemin-mozjpeg",
                    "imagemin-pngquant",
                    "imagemin-svgo"
                  ]
                }
              }
            }
          }
        ]
      }
    ]
  },
  // target: ["web", "es5"], // If targeting IE11
  resolve: {
    extensions: [".es6", ".js"]
  },
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, resourceFolder),
    chunkFilename: "js/[name].chunk.js",
    publicPath: "auto"
  }
};
