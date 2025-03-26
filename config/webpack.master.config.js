const TARGET = process.env.npm_lifecycle_event;
const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.config.js");
switch (TARGET) {
    case "build-client":
    case "full-build": {
        module.exports = merge(commonConfig, {
            mode: "development",
            devtool: "source-map"
        });
        break;
    }
    case "docker-frontend":
    case "full-build-release":
    case "build-client-release": {
        module.exports = merge(commonConfig, {
            mode: "production",
            performance: {
                hints: false,
                maxEntrypointSize: 5120000,
                maxAssetSize: 5120000
            },
            module: {
                rules: [
                    {
                        enforce: "pre",
                        test: /\.js$/,
                        loader: "source-map-loader",
                        exclude: /node_modules/
                    }
                ]
            }
        });
        break;
    }
}
