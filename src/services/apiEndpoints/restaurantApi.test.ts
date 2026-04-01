import axiosPublic from '@/services/axios/publicClient';
import axiosPrivate from '@/services/axios/privateClient';
import { restaurantApi } from './restaurantApi';

// Mock axios clients
jest.mock('@/services/axios/publicClient', () => ({
  get: jest.fn(),
}));

jest.mock('@/services/axios/privateClient', () => ({
  put: jest.fn(),
}));

describe('restaurantApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getRestaurantById should call /Restaurant/{id} with publicClient', async () => {
    const restaurantId = 1;
    (axiosPublic.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await restaurantApi.getRestaurantById(restaurantId);

    expect(axiosPublic.get).toHaveBeenCalledWith(`/Restaurant/${restaurantId}`);
  });

  it('updateReceivingOrders should call /Restaurant/{id}/receiving-orders with privateClient', async () => {
    const restaurantId = 1;
    const isReceiving = true;
    (axiosPrivate.put as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await restaurantApi.updateReceivingOrders(restaurantId, isReceiving);

    expect(axiosPrivate.put).toHaveBeenCalledWith(
      `/Restaurant/${restaurantId}/receiving-orders?isReceiving=${isReceiving}`
    );
  });
});
