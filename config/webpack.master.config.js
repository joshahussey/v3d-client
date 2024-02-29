const TARGET = process.env.npm_lifecycle_event;
const { merge } = require("webpack-merge");
const commonConfig = require("./webpack.common.config.js");
switch (TARGET) {
    case "full-build": {
        module.exports = merge(commonConfig, {
            mode: "development",
            devtool: "source-map"
        });
        break;
    }
    case "build-client": {
        module.exports = merge(commonConfig, {
            mode: "development",
            devtool: "source-map"
        });
        break;
    }
    case "full-build-release": {
        module.exports = merge(commonConfig, {
            mode: "production",
            performance: {
                hints: false,
                maxEntrypointSize: 5120000,
                maxAssetSize: 5120000
            }
        });
        break;
    }
    case "build-client-release": {
        module.exports = merge(commonConfig, {
            mode: "production",
            performance: {
                hints: false,
                maxEntrypointSize: 5120000,
                maxAssetSize: 5120000
            }
        });
        break;
    }
}
