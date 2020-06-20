// This file is needed to get Jest to call Babel
// without it Jest will not understand the JSX
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
};