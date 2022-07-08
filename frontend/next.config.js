const withAntdLess = require("next-plugin-antd-less");

module.exports = withAntdLess({
  modifyVars: {
    "@primary-color": "#9254de", // purple-5
    // Since we've disabled the toggling of themes, I've changed heading colour to black
    "@heading-color": "black",
    "@text-color": "black",
  },

  webpack(config) {
    return config;
  },
});
