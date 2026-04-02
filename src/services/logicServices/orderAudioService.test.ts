import { getOrderAudio } from './orderAudioService';
import { orderApi } from '@/services/apiEndpoints/orderApi';

// Mock orderApi
jest.mock('@/services/apiEndpoints/orderApi', () => ({
  orderApi: {
    readyForPickup: jest.fn(),
  },
}));

describe('orderAudioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderAudio', () => {
    it('should return audioUrl on success', async () => {
      (orderApi.readyForPickup as jest.Mock).mockResolvedValue({
        data: { success: true, audioUrl: 'http://example.com/audio.mp3' },
      });

      const result = await getOrderAudio(123456);
      expect(result).toBe('http://example.com/audio.mp3');
      expect(orderApi.readyForPickup).toHaveBeenCalledWith(123456);
    });

    it('should throw error when api returns failure', async () => {
      (orderApi.readyForPickup as jest.Mock).mockResolvedValue({
        data: { success: false, message: 'Failed to generate' },
      });

      await expect(getOrderAudio(123456)).rejects.toThrow('Failed to generate');
    });

    it('should throw default error if no message provided', async () => {
      (orderApi.readyForPickup as jest.Mock).mockResolvedValue({
        data: { success: false },
      });

      await expect(getOrderAudio(123456)).rejects.toThrow('Không lấy được audio');
    });
  });
});
