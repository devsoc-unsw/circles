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
              "@primary-color": "#9254de", // purple-5
              "@heading-color": "white",
              "@text-color": "white",
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
