const CracoLessPlugin = require("craco-less");
const { getThemeVariables } = require("antd/dist/theme");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#9254de",
              "@heading-color": "white",
              "@text-color": "white",
            }, // purple-5
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
