const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const widgetName = require("./package").widgetName.toLowerCase();

const widgetConfig = {
    entry: {
        DropdownTypeahead: "./src/DropdownTypeahead/components/DropdownTypeaheadContainer.ts",
        DropdownTypeaheadReferenceSet: "./src/DropdownTypeaheadReferenceSet/components/DropdownTypeaheadReferenceSetContainer.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: `src/com/mendix/widget/custom/${widgetName}/[name].js`,
        chunkFilename: `src/com/mendix/widget/custom/${widgetName}[id].js`,
        libraryTarget: "umd"
    },
    resolve: {
        extensions: [ ".ts", ".js" ],
        alias: {
            "tests": path.resolve(__dirname, "./tests")
        }
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader" },
            { test: /\.css$/, loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader"
            }) },
            { test: /\.scss$/, loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [
                    { loader: "css-loader" },
                    { loader: "sass-loader" }
                ]
            }) }
        ]
    },
    mode: "development",
    devtool: "source-map",
    externals: [ "react", "react-dom" ],
    plugins: [
        new CopyWebpackPlugin([ { from: "src/**/*.xml"} , { from: "src/**/*.js" }], { copyUnmodified: true }),
        new ExtractTextPlugin({ filename: `./src/com/mendix/widget/custom/${widgetName}/ui/[name].css` }),
        new webpack.LoaderOptionsPlugin({ debug: true })
    ]
};

const previewConfig = {
    entry: {
        DropdownTypeahead: "./src/DropdownTypeahead/DropdownTypeahead.webmodeler.ts",
        DropdownTypeaheadReferenceSet: "./src/DropdownTypeaheadReferenceSet/DropdownTypeaheadReferenceSet.webmodeler.ts",
    },
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: `src/[name]/[name].webmodeler.js`,
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    module: {
        rules: [
            { test: /\.ts$/, use: "ts-loader" },
            { test: /\.scss$/, use: [ "raw-loader", "sass-loader" ]},
            { test: /\.css$/, use: "css-loader" },
        ]
    },
    mode: "development",
    devtool: "inline-source-map",
    externals: [ "react", "react-dom" ],
    plugins: [ new webpack.LoaderOptionsPlugin({ debug: true }) ]
};

module.exports = [ widgetConfig, previewConfig ];
