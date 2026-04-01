import axiosPrivate from '@/services/axios/privateClient';
import { dishApi } from './dishApi';

// Mock axiosPrivate
jest.mock('@/services/axios/privateClient', () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

describe('dishApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getBranchDishesByRestaurant should call /BranchDishConfig/restaurants/{id}/branch-dishes', async () => {
    const restaurantId = 1;
    (axiosPrivate.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await dishApi.getBranchDishesByRestaurant(restaurantId);

    expect(axiosPrivate.get).toHaveBeenCalledWith(
      `/BranchDishConfig/restaurants/${restaurantId}/branch-dishes`
    );
  });

  it('getRestaurantMenu should call /Restaurant/{id}/menu', async () => {
    const restaurantId = 1;
    (axiosPrivate.get as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await dishApi.getRestaurantMenu(restaurantId);

    expect(axiosPrivate.get).toHaveBeenCalledWith(
      `/Restaurant/${restaurantId}/menu`
    );
  });

  it('toggleSoldOut should call /BranchDishConfig/toggle-sold-out/... with correct params', async () => {
    const restaurantId = 1;
    const id = 101;
    const isSoldOut = true;
    const quantity = 0;
    (axiosPrivate.put as jest.Mock).mockResolvedValue({ data: { isSuccess: true } });

    await dishApi.toggleSoldOut(restaurantId, id, isSoldOut, quantity);

    expect(axiosPrivate.put).toHaveBeenCalledWith(
      `/BranchDishConfig/toggle-sold-out/${restaurantId}/${id}?isSoldOut=${isSoldOut}&quantity=${quantity}`
    );
  });
});
