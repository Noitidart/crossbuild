const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const utils = require('./utils');

const PROPS = JSON.parse(fs.readFileSync('config/props.json', 'utf8')).webext;

utils.deleteFolderRecursive('./dist/webext');

try {
    utils.writeFile('node_modules/cmn/package.json', utils.readFile('node_modules/cmn/package.json').replace('"main": "lib/cmn.min.js"', '"main": "lib/cmn.js"'));
} catch(ignore) {}

PROPS.replace['~ADDON_SHUTDOWN_WAR~'] = 'shutdown-war-' + Date.now() + '.txt';
utils.writeFile('./dist/webext/' + PROPS.replace['~ADDON_SHUTDOWN_WAR~'], '');

// copy browser-polyfill to src!! not to dist! as otherwise it `import '../common/browser-polyfill'` will fail
// fs.createReadStream('node_modules/webextension-polyfill/dist/browser-polyfill.js').pipe(fs.createWriteStream('src/webext/vendor/browser-polyfill.js');

module.exports = function (env) {
    return {
        devtool: 'cheap-module-source-map',
        entry: {
            background: './src/webext/background/index.js',
            app: './src/webext/app/index.js',
            appframe: './src/webext/app/appframe.js',
            // contentscript: './src/webext/contentscript/index.js'
        },
        output: {
            path: path.join(__dirname, '../dist/webext'),
            filename: '[name]/index.bundle.js'
        },
        resolve: {
            extensions: ['.js']
        },
        module: {
            loaders: [
                { test:/\.js$/, exclude:/node_modules/, loader:'string-replace-loader', query:{ multiple:Object.entries(PROPS.replace).map(([search, replace]) => ({search, replace, flags:'g'})) }, enforce:'pre' },
                { test:/\.js$/, exclude:/node_modules/, loader:'eslint-loader', enforce:'pre' },
                { test:/\.css$/, exclude:/node_modules/, use:['style-loader', 'css-loader'] },
                { test:/\.js$/, exclude:/node_modules/, loader:'babel-loader' }
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: './src/webext', ignore: ['*.js', '*.css'], transform: (content, path) => /(svg|png|jpeg|jpg|gif)$/i.test(path) ? content : content.toString().replace(new RegExp('(?:' + Object.keys(PROPS.replace).join('|') + ')', 'g'), match => PROPS.replace[match]) },
                { from: './src/webext/vendor', to: 'vendor/' }
            ])
        ]
    }
}