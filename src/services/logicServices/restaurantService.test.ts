import { restaurantService } from './restaurantService';
import { restaurantApi } from '@/services/apiEndpoints/restaurantApi';
jest.mock('@/services/apiEndpoints/restaurantApi', () => ({
  restaurantApi: {
    getRestaurantById: jest.fn(),
    updateReceivingOrders: jest.fn(),
  },
}));
describe('restaurantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getRestaurantById', () => {
    it('should return restaurant details on success', async () => {
      const mockRestaurant = { id: 1, name: 'Resto' };
      (restaurantApi.getRestaurantById as jest.Mock).mockResolvedValue({
        data: { isSuccess: true, data: mockRestaurant },
      });
      const result = await restaurantService.getRestaurantById(1);
      expect(result).toEqual(mockRestaurant);
    });
    it('should throw error when API returns failure', async () => {
      (restaurantApi.getRestaurantById as jest.Mock).mockResolvedValue({
        data: { isSuccess: false, message: 'NotFound' },
      });
      await expect(restaurantService.getRestaurantById(1)).rejects.toThrow('NotFound');
    });
  });
  describe('updateReceivingOrders', () => {
    it('should return update result on success', async () => {
      const mockResult = { id: 1, isReceiving: true };
      (restaurantApi.updateReceivingOrders as jest.Mock).mockResolvedValue({
        data: { isSuccess: true, data: mockResult },
      });
      const result = await restaurantService.updateReceivingOrders(1, true);
      expect(result).toEqual(mockResult);
    });
    it('should throw error when API returns failure', async () => {
      (restaurantApi.updateReceivingOrders as jest.Mock).mockResolvedValue({
        data: { isSuccess: false, message: 'Update Fail' },
      });
      await expect(restaurantService.updateReceivingOrders(1, true)).rejects.toThrow('Update Fail');
    });
  });
});
