import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
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
        alias: {
          '@lezer/common': path.resolve(__dirname, 'node_modules/@lezer/common'),
          '@lezer/highlight': path.resolve(__dirname, 'node_modules/@lezer/highlight'),
          '@lezer/lr': path.resolve(__dirname, 'node_modules/@lezer/lr'),
          '@codemirror/autocomplete': path.resolve(__dirname, 'node_modules/@codemirror/autocomplete'),
          '@codemirror/language': path.resolve(__dirname, 'node_modules/@codemirror/language')
        }
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