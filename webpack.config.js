const webpack = require('webpack');
const pkg = require('./package.json');
const path = require('path');
const libraryName= pkg.name;

module.exports = {
    entry: path.join(__dirname, "./src/index.js"),
    output: {
        path: path.join(__dirname, './dist'),
        filename: 'index.js',
        library: libraryName,
        libraryTarget: 'umd',
        publicPath: '/dist/',
        umdNamedDefine: true
    },
    node: {
      net: 'empty',
      tls: 'empty',
      dns: 'empty'
    },
    module: {
        rules : [
        {
            test: /\.(js|jsx)$/,
            use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/react']
        }
      }],
            include: path.resolve(__dirname, "src"),
            exclude: /node_modules/,
        }
        ]
    },
    resolve: {
        alias: {
            'react': path.resolve(__dirname, './node_modules/react') ,
            'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
            'assets': path.resolve(__dirname, 'assets')
        }
    },
    externals: {
        // Don't bundle react or react-dom
        react: {
            commonjs: "react",
            commonjs2: "react",
            amd: "React",
            root: "React"
        },
        "react-dom": {
            commonjs: "react-dom",
            commonjs2: "react-dom",
            amd: "ReactDOM",
            root: "ReactDOM"
        }
    }
};