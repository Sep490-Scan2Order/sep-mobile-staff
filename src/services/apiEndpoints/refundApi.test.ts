import axiosPrivate from '@/services/axios/privateClient';
import { refundApi } from './refundApi';
import { RefundRequest } from '@/type';

// Mock axiosPrivate
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

  it('createRefund should call /Refund with correct data', async () => {
    const mockData: RefundRequest = {
      orderId: 'order-123',
      reason: 'Customer requested',
    } as any;
    (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await refundApi.createRefund(mockData);

    expect(axiosPrivate.post).toHaveBeenCalledWith('/Refund', mockData);
  });

  it('confirmSystemPayment should call /Refund/confirm-system-payment with FormData and headers', async () => {
    const mockFormData = new FormData();
    mockFormData.append('orderId', 'order-123');
    mockFormData.append('amount', '100000');
    
    (axiosPrivate.post as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await refundApi.confirmSystemPayment(mockFormData);

    expect(axiosPrivate.post).toHaveBeenCalledWith(
      '/Refund/confirm-system-payment',
      mockFormData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  });
});
