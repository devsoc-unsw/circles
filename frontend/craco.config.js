const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              "@primary-color": "#9254de", // purple-5
              // Since we've disabled the toggling of themes, I've changed heading colour to black
              "@heading-color": "black",
              "@text-color": "black",
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
