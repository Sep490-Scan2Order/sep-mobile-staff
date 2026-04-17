jest.setTimeout(15000)

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

// Mock lucide-react-native using mock-prefixed variables to avoid hoisting issues
// This allows icons to be rendered as valid components with testIDs without Babel transformation errors
const mockReact = require('react');
const mockReactNative = require('react-native');

const mockIcon = (name: string) => {
  return (props: any) => mockReact.createElement(mockReactNative.View, { ...props, testID: `icon-${name}` });
};

const mockLucide = {
  Eye: mockIcon('Eye'),
  EyeOff: mockIcon('EyeOff'),
  ChevronLeft: mockIcon('ChevronLeft'),
  Calendar: mockIcon('Calendar'),
  Phone: mockIcon('Phone'),
  MoreVertical: mockIcon('MoreVertical'),
  Search: mockIcon('Search'),
  X: mockIcon('X'),
  Trash2: mockIcon('Trash2'),
  Plus: mockIcon('Plus'),
  Minus: mockIcon('Minus'),
  ChevronDown: mockIcon('ChevronDown'),
  User: mockIcon('User'),
  Camera: mockIcon('Camera'),
  CheckCircle: mockIcon('CheckCircle'),
  XCircle: mockIcon('XCircle'),
  AlertTriangle: mockIcon('AlertTriangle'),
  Info: mockIcon('Info'),
  AlertCircle: mockIcon('AlertCircle'),
  LogOut: mockIcon('LogOut'),
  Users: mockIcon('Users'),
  ShieldAlert: mockIcon('ShieldAlert'),
  Clock: mockIcon('Clock'),
  Store: mockIcon('Store'),
  ShoppingBag: mockIcon('ShoppingBag'),
  ChevronRight: mockIcon('ChevronRight'),
  Lock: mockIcon('Lock'),
  Hash: mockIcon('Hash'),
  MapPin: mockIcon('MapPin'),
  CreditCard: mockIcon('CreditCard'),
  ArrowLeft: mockIcon('ArrowLeft'),
  TrendingUp: mockIcon('TrendingUp'),
  RotateCcw: mockIcon('RotateCcw'),
  Power: mockIcon('Power'),
  ClipboardList: mockIcon('ClipboardList'),
  CookingPot: mockIcon('CookingPot'),
  CheckCircle2: mockIcon('CheckCircle2'),
  Truck: mockIcon('Truck'),
  LayoutDashboard: mockIcon('LayoutDashboard'),
};

jest.mock('lucide-react-native', () => mockLucide);

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
    useFocusEffect: (cb: any) => cb(),
  }
})

// Mock Async Storage
const mockAsyncStorage = {
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  multiMerge: jest.fn(() => Promise.resolve()),
  flushGetRequests: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  ...mockAsyncStorage,
  createAsyncStorage: jest.fn(() => mockAsyncStorage),
}))

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  const MockSound = jest.fn().mockImplementation((name, bundle, callback) => {
    if (callback) {
      // Simulate successful load asynchronously
      setTimeout(() => callback(null), 0);
    }
    return {
      setVolume: jest.fn(),
      setNumberOfLoops: jest.fn(),
      play: jest.fn(cb => {
        if (cb) cb(true);
      }),
      stop: jest.fn(),
      release: jest.fn(),
      getCurrentTime: jest.fn(cb => {
        if (cb) cb(0);
      }),
      getDuration: jest.fn(() => 10),
      getNumberOfChannels: jest.fn(() => 2),
      setCurrentTime: jest.fn(),
    };
  });

  (MockSound as any).setCategory = jest.fn();
  (MockSound as any).setActive = jest.fn();
  (MockSound as any).MAIN_BUNDLE = 0;

  return MockSound;
});

// Mock react-native-config
jest.mock('react-native-config', () => ({
  API_BASE_URL: 'http://localhost:5201/api',
  API_URL: 'http://localhost:5201/api',
}));

// Mock react-native-dotenv
jest.mock('react-native-dotenv', () => ({
  API_BASE_URL: 'http://localhost:5201/api',
}));

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

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


