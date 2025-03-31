const cesiumSource = "../node_modules/cesium/Source";
const purify = "../node_modules/dompurify/dist/purify.js.map";
const cesiumWorkers = "../Build/Cesium/Workers";
const static = "../static";
const glbmodels = "../src/glbmodels";
const CSS = "../src/CSS";
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

module.exports = {
    experiments: {
        topLevelAwait: true
    },
    context: __dirname,
    entry: {
        app: "../src/3dMap.tsx"
    },
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "../web"),
        sourcePrefix: ""
    },
    amd: {
        toUrlUndefined: true
    },
    resolve: {
        extensions: [".ts", ".js", ".tsx"],
        alias: {
            cesium: path.resolve(__dirname, cesiumSource)
        },
        mainFiles: ["module", "main", "Cesium"],
        fallback: {
            assert: require.resolve("assert"),
            buffer: require.resolve("buffer"),
            console: require.resolve("console-browserify"),
            constants: require.resolve("constants-browserify"),
            crypto: require.resolve("crypto-browserify"),
            domain: require.resolve("domain-browser"),
            events: require.resolve("events"),
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            os: require.resolve("os-browserify/browser"),
            path: require.resolve("path-browserify"),
            punycode: require.resolve("punycode"),
            process: require.resolve("process/browser"),
            querystring: require.resolve("querystring-es3"),
            stream: require.resolve("stream-browserify"),
            string_decoder: require.resolve("string_decoder"),
            sys: require.resolve("util"),
            timers: require.resolve("timers-browserify"),
            tty: require.resolve("tty-browserify"),
            url: require.resolve("url"),
            util: require.resolve("util"),
            vm: require.resolve("vm-browserify"),
            zlib: require.resolve("browserify-zlib"),
            has: require.resolve("has"),
            purify: require.resolve("purify")
        }
    },
    optimization: { minimize: false },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)?$/,
                exclude: "/node_modules/",
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "minify",
                            "@babel/preset-env",
                            "@babel/preset-typescript",
                            ["solid", { generate: "dom", hydratable: true }]
                        ],
                        plugins: ["@babel/plugin-transform-named-capturing-groups-regex"]
                    }
                }
            },
            {
                test: /\.(s[ac]ss|css)$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.(png|gif|jpg|jpeg|svg|xml)$/,
                use: ["url-loader"]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser"
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(cesiumSource, cesiumWorkers), to: "Workers" },
                { from: path.join(cesiumSource, "Assets"), to: "Assets" },
                { from: path.join(cesiumSource, "Widgets"), to: "Widgets" },
                { from: path.join(cesiumSource, "ThirdParty"), to: "ThirdParty" },
                { from: path.join(purify), to: "." },
                {
                    from: path.join(static),
                    to: "."
                },
                { from: path.join(CSS, "loading.css"), to: "loading.css" }
            ]
        }),
        new webpack.DefinePlugin({
            CESIUM_BASE_URL: JSON.stringify(""),
            AWS_SOCKET: JSON.stringify(process.env.AWS_SOCKET)
        }),
        console.log("process.env.AWS_SOCKET", process.env.AWS_SOCKET),
        new HtmlWebpackPlugin({
            template: "../src/index.html",
            filename: "index.html"
            // minify: false,
            // hash: true,
            // showErrors: true,
            // cache: true,
        }),
        new webpack.EnvironmentPlugin(["CSLT_3D_HTTP_PORT", "CSLT_3D_HTTPS_PORT"])
    ]
};
