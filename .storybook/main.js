const path = require('path');
module.exports = {
  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
  webpackFinal: async config => {
    // do mutation to the config
    config.module.rules.push({
      test: /.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader']
  })
  config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)?$/,
      loader: 'babel-loader?cacheDirectory',
      exclude: path.resolve(__dirname, 'node_modules'),
  });

  config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx'];
    return config;
  },
};
