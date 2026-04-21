import axiosPrivate from '@/services/axios/privateClient';
import { refundApi } from './refundApi';
import { RefundRequest } from '@/type';
jest.mock('@/services/axios/privateClient', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));
describe('refundApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('createRefund should call /Refund with FormData', async () => {
    const mockFormData = new FormData();
    mockFormData.append('orderId', 'order-123');
    (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });
    await refundApi.createRefund(mockFormData);
    expect(axiosPrivate.post).toHaveBeenCalledWith(
      '/Refund',
      mockFormData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: expect.any(Function),
      }
    );
  });
  it('confirmSystemPayment should call /Refund/confirm-system-payment with FormData', async () => {
    const mockFormData = new FormData();
    mockFormData.append('orderId', 'order-123');
    mockFormData.append('amount', '100000');
    (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });
    await refundApi.confirmSystemPayment(mockFormData);
    expect(axiosPrivate.post).toHaveBeenCalledWith(
      '/Refund/confirm-system-payment',
      mockFormData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: expect.any(Function),
      }
    );
  });
});
