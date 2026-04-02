import Sound from 'react-native-sound';
import { playAudioUrl } from './playAudioUrl';

// Mock react-native-sound
let mockSoundInstance: any;

jest.mock('react-native-sound', () => {
    const mockSoundConstructor: any = jest.fn().mockImplementation((url, basePath, callback) => {
        mockSoundInstance = {
            play: jest.fn((playCallback) => {
                const success = url !== 'fail_url';
                playCallback(success);
            }),
            release: jest.fn(),
        };
        
        setTimeout(() => {
            if (url === 'error_url') {
                callback(new Error('Load failed'));
            } else {
                callback(null);
            }
        }, 0);

        return mockSoundInstance;
    });

    mockSoundConstructor.setCategory = jest.fn();
    return mockSoundConstructor;
});

describe('playAudioUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should play sound and resolve true on success', async () => {
    const result = await playAudioUrl('http://test.com/sound.mp3');
    expect(result).toBe(true);
    expect(mockSoundInstance.play).toHaveBeenCalled();
    expect(mockSoundInstance.release).toHaveBeenCalled();
  });

  it('should reject when sound loading fails', async () => {
    await expect(playAudioUrl('error_url')).rejects.toThrow('Load failed');
  });

  it('should reject when sound playback fails', async () => {
    await expect(playAudioUrl('fail_url')).rejects.toBe('Playback failed');
  });
});
