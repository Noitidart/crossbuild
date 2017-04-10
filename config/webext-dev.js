const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const PROPS = JSON.parse(fs.readFileSync('config/props.json', 'utf8')).webext;

module.exports = function (env) {
    return {
        devtool: 'cheap-module-source-map',
        entry: {
            background: './src/webext/background/background.js',
            app: './src/webext/app/app.js'
        },
        output: {
            path: path.join(__dirname, '../dist/webext'),
            filename: '[name]/[name].bundle.js'
        },
        resolve: {
            extensions: ['.js']
        },
        module: {
            loaders: [
                { test:/\.js$/, exclude:/node_modules/, loader:'string-replace-loader', query:{ multiple:Object.entries(PROPS.replace).map(([search, replace]) => ({search, replace})) }, enforce:'pre' },
                { test:/\.js$/, exclude:/node_modules/, loader:'eslint-loader', enforce:'pre' },
                { test:/\.css$/, exclude:/node_modules/, use:['style-loader', 'css-loader'] },
                { test:/\.js$/, exclude:/node_modules/, loader:'babel-loader' }
            ]
        },
        plugins: [
            new CopyWebpackPlugin([{
                from: './src/webext',
                transform: content => content.toString().replace(new RegExp('(?:' + Object.keys(PROPS.replace).join('|') + ')', 'g'), match => PROPS.replace[match])
            }], { ignore: ['*.js', '*.css'] })
        ]
    }
}