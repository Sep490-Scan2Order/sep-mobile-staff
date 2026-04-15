import axiosPrivate from '@/services/axios/privateClient';
import { staffApi } from './staffApi';

// Mock axiosPrivate
jest.mock('@/services/axios/privateClient', () => ({
  get: jest.fn(),
}));

describe('staffApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getStaffByRestaurant should call /Staff/restaurant?restaurantId={id}', async () => {
    const restaurantId = 123;
    (axiosPrivate.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true, data: [] } });

    await staffApi.getStaffByRestaurant(restaurantId);

    expect(axiosPrivate.get).toHaveBeenCalledWith(`/Staff/restaurant?restaurantId=${restaurantId}`);
  });
});
