const withAntdLess = require("next-plugin-antd-less");

module.exports = withAntdLess({
  // optional
  modifyVars: {
    "@primary-color": "#9254de", // purple-5
    // Since we've disabled the toggling of themes, I've changed heading colour to black
    "@heading-color": "black",
    "@text-color": "black",
  },
  // optional
  // lessVarsFilePath: "./src/styles/variables.less",
  // // optional
  // lessVarsFilePathAppendToEndOfContent: false,
  // optional https://github.com/webpack-contrib/css-loader#object
  cssLoaderOptions: {},

  // Other Config Here...

  webpack(config) {
    return config;
  },
});
