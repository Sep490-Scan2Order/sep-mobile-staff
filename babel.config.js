module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    ...(process.env.NODE_ENV === 'test' ? [] : ['nativewind/babel']),
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        cwd: 'babelrc',
        alias: {
          '@': './src',
        },
        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.jsx',
          '.android.jsx',
          '.js',
          '.jsx',
          '.json',
          '.ts',
          '.tsx',
        ],
      },
    ],
    'react-native-worklets-core/plugin',
    ['react-native-reanimated/plugin'],
  ],
};