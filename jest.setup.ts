// Author: Dựa trên phong cách TrungQuanDev
import '@testing-library/jest-native/extend-expect'

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 }
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => inset,
  }
})

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  Eye: 'Eye',
  EyeOff: 'EyeOff',
  ChevronLeft: 'ChevronLeft',
}))

// Mock các thư viện Native phổ biến để tránh lỗi môi trường Node
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({ children }: any) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  }
})

// Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))

// Mock Redux Persist
jest.mock('redux-persist', () => {
  return {
    ...jest.requireActual('redux-persist'),
    persistStore: jest.fn().mockReturnValue({
      pause: jest.fn(),
      resume: jest.fn(),
      updateCondition: jest.fn(),
      flush: jest.fn(),
      purge: jest.fn(),
      dispatch: jest.fn(),
      getState: jest.fn(),
      subscribe: jest.fn(),
    }),
  }
})

jest.mock('redux-persist/lib/integration/react', () => ({
  PersistGate: ({ children }: any) => children,
}))

// Tắt các log không cần thiết khi chạy test
console.error = jest.fn()
console.warn = jest.fn()
