import axiosPrivate from '@/services/axios/privateClient';
import { orderApi, scanQrApi } from './orderApi';

// Mock axiosPrivate
jest.mock('@/services/axios/privateClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

describe('orderApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('orderApi object', () => {
    it('getActiveOrders should call /Order/kds/active-orders/{id}', async () => {
      const restaurantId = 1;
      (axiosPrivate.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

      await orderApi.getActiveOrders(restaurantId);

      expect(axiosPrivate.get).toHaveBeenCalledWith(`/Order/kds/active-orders/${restaurantId}`);
    });

    it('updateOrderStatus should call /Order/update-status/{id} with newStatus', async () => {
      const orderId = 'order-123';
      const newStatus = 2;
      (axiosPrivate.put as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

      await orderApi.updateOrderStatus(orderId, newStatus);

      expect(axiosPrivate.put).toHaveBeenCalledWith(`/Order/update-status/${orderId}?newStatus=${newStatus}`);
    });

    it('listOrders should call /Order/cart/{id}', async () => {
      const cartId = 'cart-123';
      (axiosPrivate.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

      await orderApi.listOrders(cartId);

      expect(axiosPrivate.get).toHaveBeenCalledWith(`/Order/cart/${cartId}`);
    });

    it('getPendingCashOrders should call /Order/cash/pending-confirm', async () => {
      (axiosPrivate.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

      await orderApi.getPendingCashOrders();

      expect(axiosPrivate.get).toHaveBeenCalledWith(`/Order/cash/pending-confirm`);
    });

    it('confirmCashOrder should call /Order/cash/{id}/confirm', async () => {
      const orderId = 'order-123';
      (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

      await orderApi.confirmCashOrder(orderId);

      expect(axiosPrivate.post).toHaveBeenCalledWith(`/Order/cash/${orderId}/confirm`);
    });

    it('readyForPickup should call /Order/ready-for-pickup/{code}', async () => {
      const orderCode = 123456;
      (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

      await orderApi.readyForPickup(orderCode);

      expect(axiosPrivate.post).toHaveBeenCalledWith(`/Order/ready-for-pickup/${orderCode}`);
    });

    it('confirmPickupTime should call /Order/confirm-pickup-time with correct data', async () => {
      const orderId = 'order-123';
      const confirmedPickupAt = '2023-10-27T10:00:00Z';
      (axiosPrivate.put as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

      await orderApi.confirmPickupTime(orderId, confirmedPickupAt);

      expect(axiosPrivate.put).toHaveBeenCalledWith(`/Order/confirm-pickup-time`, {
        orderId,
        confirmedPickupAt,
      });
    });
  });

  describe('scanQrApi function', () => {
    it('scanQrApi should call /Order/scan-qr and return audioUrl', async () => {
      const qrContent = 'qr-content-123';
      const orderNumber = 456;
      const mockAudioUrl = 'http://example.com/audio.mp3';
      (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { data: mockAudioUrl } });

      const result = await scanQrApi(qrContent, orderNumber);

      expect(axiosPrivate.post).toHaveBeenCalledWith(`/Order/scan-qr`, {
        qrContent,
        orderNumber,
      });
      expect(result).toBe(mockAudioUrl);
    });
  });
});
