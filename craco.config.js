const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { 
              '@primary-color': '#2677C6',
              '@border-radius-base': '4px',
              '@font-size-base': '14px',
              '@border-color-base': '#d9d9d9',
              '@box-shadow-base': '0 3px 6px 4px rgba(0, 0, 0, 0.12)',
              '@text-color': 'rgba(0, 0, 0, 0.65)',
             },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};