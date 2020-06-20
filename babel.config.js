// This file is needed to get Jest to call Babel
// without it Est will not understand the JSX
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
};