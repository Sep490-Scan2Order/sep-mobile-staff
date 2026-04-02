import { orderService } from './orderService';
import { orderApi, scanQrApi } from '@/services/apiEndpoints/orderApi';

// Mock orderApi and scanQrApi
jest.mock('@/services/apiEndpoints/orderApi', () => ({
  orderApi: {
    getActiveOrders: jest.fn(),
    updateOrderStatus: jest.fn(),
    listOrders: jest.fn(),
    getPendingCashOrders: jest.fn(),
    confirmCashOrder: jest.fn(),
    readyForPickup: jest.fn(),
    confirmPickupTime: jest.fn(),
  },
  scanQrApi: jest.fn(),
}));

describe('orderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveOrders', () => {
    it('should return list orders on success', async () => {
      const mockOrders = [{ id: '1' }, { id: '2' }];
      (orderApi.getActiveOrders as jest.Mock).mockResolvedValue({
        data: { isSuccess: true, data: mockOrders },
      });

      const result = await orderService.getActiveOrders(1);
      expect(result).toEqual(mockOrders);
    });

    it('should throw error on failure', async () => {
      (orderApi.getActiveOrders as jest.Mock).mockResolvedValue({
        data: { isSuccess: false, message: 'Api Error' },
      });

      await expect(orderService.getActiveOrders(1)).rejects.toThrow('Api Error');
    });
  });

  describe('updateOrderStatus', () => {
    it('should return updated order data on success', async () => {
      const mockResult = { id: '1', status: 2 };
      (orderApi.updateOrderStatus as jest.Mock).mockResolvedValue({
        data: { isSuccess: true, data: mockResult },
      });

      const result = await orderService.updateOrderStatus('1', 2);
      expect(result).toEqual(mockResult);
    });
  });

  describe('listOrders', () => {
    it('should return orders by cartId', async () => {
      const mockOrders = [{ id: '1' }];
      (orderApi.listOrders as jest.Mock).mockResolvedValue({
        data: { isSuccess: true, data: mockOrders },
      });

      const result = await orderService.listOrders('cart_id');
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getPendingCashOrders', () => {
    it('should return pending cash orders', async () => {
      const mockOrders = [{ id: '1', paymentStatus: 'pending' }];
      (orderApi.getPendingCashOrders as jest.Mock).mockResolvedValue({
        data: { isSuccess: true, data: mockOrders },
      });

      const result = await orderService.getPendingCashOrders();
      expect(result).toEqual(mockOrders);
    });

    it('should throw error when failing', async () => {
      (orderApi.getPendingCashOrders as jest.Mock).mockResolvedValue({
        data: { isSuccess: false, message: 'Wait for response' },
      });

      await expect(orderService.getPendingCashOrders()).rejects.toThrow('Wait for response');
    });
  });

  describe('confirmCashOrder', () => {
    it('should return confirmation data', async () => {
      const mockResult = { id: '1', isPaid: true };
      (orderApi.confirmCashOrder as jest.Mock).mockResolvedValue({
        data: { isSuccess: true, data: mockResult },
      });

      const result = await orderService.confirmCashOrder('1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('readyForPickup', () => {
    it('should return audio generation result on success', async () => {
      const mockResponse = { success: true, audioUrl: 'url' };
      (orderApi.readyForPickup as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      const result = await orderService.readyForPickup(123456);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when api success is false', async () => {
      (orderApi.readyForPickup as jest.Mock).mockResolvedValue({
        data: { success: false, message: 'Audio fail' },
      });

      await expect(orderService.readyForPickup(123456)).rejects.toThrow('Audio fail');
    });
  });

  describe('confirmPickupTime', () => {
    it('should return result on success', async () => {
      const mockResult = { success: true };
      (orderApi.confirmPickupTime as jest.Mock).mockResolvedValue({
        data: { isSuccess: true, data: mockResult },
      });

      const result = await orderService.confirmPickupTime('o1', '2024-03-30');
      expect(result).toEqual(mockResult);
    });
  });

  describe('scanOrderQr', () => {
    it('should return audioUrl on success', async () => {
      (scanQrApi as jest.Mock).mockResolvedValue('audioUrl');

      const result = await orderService.scanOrderQr('content', 1);
      expect(result).toBe('audioUrl');
    });

    it('should rethrow error from scanQrApi', async () => {
      const error = new Error('Scan fail');
      (scanQrApi as jest.Mock).mockRejectedValue(error);

      await expect(orderService.scanOrderQr('content', 1)).rejects.toThrow('Scan fail');
    });
  });
});
