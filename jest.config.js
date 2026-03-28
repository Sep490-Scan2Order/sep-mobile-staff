module.exports = {
  // Preset react-native giúp Jest hiểu các thành phần của React Native (View, Text, v.v.)
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Chạy file setup sau khi môi trường Jest được khởi tạo để thiết lập các mock global
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Explicitly transform JS/TS files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }],
    '^.+\\.css$': 'jest-transform-stub',
  },

  // Mapping các alias để Jest có thể tìm thấy module khi sử dụng @/
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.css$': 'jest-transform-stub',
  },

  // Loại bỏ các file không cần thiết khỏi quá trình test
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],

  // Hỗ trợ TypeScript qua babel-jest (đi kèm với RN preset)
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-community|nativewind|react-native-reanimated|react-redux|@reduxjs/toolkit|redux-persist|react-native-sound|immer|react-native-config|react-native-dotenv|react-native-toast-message|lucide-react-native|react-native-svg|react-native-vision-camera|react-native-worklets-core)/)',
  ],
};
