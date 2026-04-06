import Sound from 'react-native-sound';
import { Platform } from 'react-native';

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  const mockSound = jest.fn().mockImplementation((name, bundle, callback) => {
    // Simulate successful load
    setTimeout(() => callback(null), 10);
    return {
      play: jest.fn((cb) => cb && cb(true)),
      stop: jest.fn(),
      release: jest.fn(),
      setVolume: jest.fn(),
      setNumberOfLoops: jest.fn(),
      setCurrentTime: jest.fn(),
    };
  });

  // Adding static methods to the mock itself
  (mockSound as any).MAIN_BUNDLE = 'main_bundle';
  (mockSound as any).setCategory = jest.fn();
  (mockSound as any).setActive = jest.fn();

  return mockSound;
});

// Import after mock is partially set up if needed, but jest.mock should handle it
import { playNotificationSound, releaseSound, playAudioFromUrl, getWhoosh } from './notificationSound';

describe('notificationSound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    releaseSound(); // Reset internal state
  });

  it('should load and play sound on playNotificationSound', async () => {
    await playNotificationSound();
    expect(Sound).toHaveBeenCalled();
  });

  it('should only load sound once even if called multiple times (concurrency)', async () => {
    await Promise.all([
      playNotificationSound(),
      playNotificationSound(),
      getWhoosh()
    ]);
    expect(Sound).toHaveBeenCalledTimes(1);
  });

  it('should release sound correctly', async () => {
    await getWhoosh();
    expect(Sound).toHaveBeenCalledTimes(1);
    
    releaseSound();
    
    await getWhoosh();
    expect(Sound).toHaveBeenCalledTimes(2);
  });

  it('should play audio from URL', () => {
    const url = 'http://example.com/audio.mp3';
    playAudioFromUrl(url);
    expect(Sound).toHaveBeenCalledWith(url, undefined, expect.any(Function));
  });

  it('should handle android specific attempts', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    
    releaseSound();
    await getWhoosh();
    
    expect(Sound).toHaveBeenCalledWith('whoosh', 'main_bundle', expect.any(Function));
    
    Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true });
  });
});
