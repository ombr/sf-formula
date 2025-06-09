const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './demo.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        /* alias: {
            '@codemirror/state': require.resolve('@codemirror/state'),
            'lezer-common': require.resolve('@lezer/common'),
            'lezer-highlight': require.resolve('@lezer/highlight'),
            'lezer-lr': require.resolve('@lezer/lr'),
        } */
    },
    output: {
        filename: 'demo.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html',
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 8080,
        open: true,
        hot: true,
    },
}; 