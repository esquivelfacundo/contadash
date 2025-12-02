module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Comentar react-native-reanimated temporalmente si causa problemas
      // 'react-native-reanimated/plugin',
    ],
  };
};
