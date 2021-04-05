const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const path = require("path");

const appRoot = __dirname;


module.exports = (env, argv) => ({
    mode: argv.mode === "production" ? "production" : "development",
    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: argv.mode === "production" ? false : "inline-source-map",
    watch: true,
    entry: {
        plugin: "./src/code.ts",
        ui: "./src/components/index.tsx",
    },
    output: {
        filename: "[name].js",
        path: path.join(appRoot, "dist"),
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        plugins: [new TsconfigPathsPlugin()],
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: "ts-loader" },
            { test: /\.s?css$/, use: ["style-loader", "css-loader", "sass-loader"] },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/components/index.html",
            filename: "ui.html",
            inlineSource: ".(js)$",
            chunks: ["ui"],
        }),
        new HtmlWebpackInlineSourcePlugin(),
    ].filter(Boolean),
});

