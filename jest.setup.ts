jest.setTimeout(15000)

// Author: Dựa trên phong cách TrungQuanDev
import '@testing-library/jest-native/extend-expect'

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockComponent = ({ children }: any) => React.createElement(View, {}, children);
  MockComponent.displayName = 'SafeAreaProvider';
  return {
    SafeAreaProvider: MockComponent,
    SafeAreaView: ({ children }: any) => React.createElement(View, {}, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

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

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const RN = require('react-native');
  
  const Animated = {
    View: RN.View,
    Text: RN.Text,
    Image: RN.Image,
    ScrollView: RN.ScrollView,
    FlatList: RN.FlatList,
    createAnimatedComponent: (c: any) => c,
    timing: () => ({ start: () => {} }),
    spring: () => ({ start: () => {} }),
    Value: jest.fn(() => ({ setValue: jest.fn() })),
    event: jest.fn(),
    add: jest.fn(),
    divide: jest.fn(),
    multiply: jest.fn(),
    sub: jest.fn(),
    interpolate: jest.fn(),
    Node: jest.fn(),
    Extrapolate: { CLAMP: 'clamp' },
  };

  return {
    __esModule: true,
    default: {
      ...Animated,
      call: () => {},
    },
    ...Animated,
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (cb: any) => cb(),
    withTiming: (v: any) => v,
    withSpring: (v: any) => v,
    withRepeat: (v: any) => v,
    withSequence: (v: any) => v,
    withDelay: (v: any, anim: any) => anim,
    runOnJS: (fn: any) => fn,
    runOnUI: (fn: any) => fn,
    makeMutable: (v: any) => ({ value: v }),
    FadeIn: { duration: () => ({ delay: () => ({ springify: () => {} }) }) },
    FadeOut: { duration: () => ({ delay: () => ({ springify: () => {} }) }) },
    FadeInDown: { delay: () => ({ duration: () => ({ springify: () => {} }) }), duration: () => ({ delay: () => ({ springify: () => {} }) }) },
    FadeInUp: { delay: () => ({ duration: () => ({ springify: () => {} }) }), duration: () => ({ delay: () => ({ springify: () => {} }) }) },
    FadeOutUp: { delay: () => ({ duration: () => ({ springify: () => {} }) }), duration: () => ({ delay: () => ({ springify: () => {} }) }) },
    SlideInRight: { duration: () => ({ delay: () => ({ springify: () => {} }) }) },
    SlideOutLeft: { duration: () => ({ delay: () => ({ springify: () => {} }) }) },
    Layout: { springify: () => ({ duration: () => {} }) },
    Easing: {
      linear: (v: any) => v,
      ease: (v: any) => v,
      quad: (v: any) => v,
      cubic: (v: any) => v,
      bezier: () => ({ factory: () => {} }),
      in: (v: any) => v,
      out: (v: any) => v,
      inOut: (v: any) => v,
    },
    useAnimatedGestureHandler: () => ({}),
    useAnimatedScrollHandler: () => ({}),
    useDerivedValue: (cb: any) => ({ value: cb() }),
  };
});

// Mock react-native-worklets
jest.mock('react-native-worklets', () => {
  const mock = {
    Worklets: {
      createRunOnJS: (fn: any) => fn,
      createRunOnContext: (fn: any) => fn,
    },
    createSerializable: (v: any) => v,
    createSynchronizable: (v: any) => v,
    set: (v: any) => v,
    get: (v: any) => v,
  };
  return {
    ...mock,
    __esModule: true,
    default: mock,
  };
});

jest.mock('react-native-worklets-core', () => {
  const mock = {
    Worklets: {
      createRunOnJS: (fn: any) => fn,
      createRunOnContext: (fn: any) => fn,
    },
    createSerializable: (v: any) => v,
    createSynchronizable: (v: any) => v,
    set: (v: any) => v,
    get: (v: any) => v,
  };
  return {
    ...mock,
    __esModule: true,
    default: mock,
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(),
      isFocused: jest.fn(() => true),
    })),
    useRoute: jest.fn(() => ({
      params: {},
    })),
    createNavigationContainerRef: jest.fn(() => ({
      isReady: jest.fn(() => true),
      navigate: jest.fn(),
      addListener: jest.fn(() => () => {}),
      removeListener: jest.fn(),
      getCurrentRoute: jest.fn(() => ({ name: 'Home' })),
    })),
    NavigationContainer: ({ children }: any) => children,
    useNavigationState: jest.fn(() => 'Home'),
    useFocusEffect: jest.fn((cb: any) => cb()),
  };
});

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

// Mock react-native-css-interop
jest.mock('react-native-css-interop', () => ({
  cssInterop: (c: any) => c,
  remapProps: (c: any) => c,
  verify: () => {},
}));

// Mock common components and hooks
// Mock common components
jest.mock('@/components/AppModal', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    AppModal: (props: any) => {
      if (!props.visible && !props.modalConfig?.visible) return null;
      const config = props.modalConfig || props;
      return React.createElement(View, { testID: "app-modal" },
        React.createElement(Text, {}, config.title),
        React.createElement(Text, {}, config.message || config.content),
        ...(config.buttons || []).map((btn: any, idx: number) => 
          React.createElement(TouchableOpacity, { key: idx, onPress: btn.onPress },
            React.createElement(Text, {}, btn.label)
          )
        )
      );
    }
  };
});
jest.mock('@/components/AppSnackbar', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    AppSnackbar: (props: any) => {
      if (!props.visible && !props.config?.visible) return null;
      const config = props.config || props;
      return React.createElement(View, { testID: "app-snackbar" },
        React.createElement(Text, {}, config.message)
      );
    }
  };
});

// Tắt các log không cần thiết khi chạy test
console.error = jest.fn()
console.warn = jest.fn()


