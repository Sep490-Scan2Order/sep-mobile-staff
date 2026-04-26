import { dishService } from './dishService';
import { dishApi } from '@/services/apiEndpoints/dishApi';
jest.mock('@/services/apiEndpoints/dishApi', () => ({
  dishApi: {
    getRestaurantMenu: jest.fn(),
    toggleSoldOut: jest.fn(),
  },
}));
describe('dishService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getBranchDishes', () => {
    it('should return flattened list of dishes on success', async () => {
      const mockApiData = [
        {
          categoryName: 'Drinks',
          dishes: [
            {
              dishId: 1,
              dishName: 'Coffee',
              imageUrl: 'img1',
              isSoldOut: false,
              price: 20000,
              discountedPrice: 15000,
              promotionName: 'Sale',
              promotionLabel: '-25%',
              hasPromotion: true,
            },
          ],
        },
        {
          categoryName: 'Food',
          dishes: [
            {
              dishId: 2,
              dishName: 'Bread',
              imageUrl: 'img2',
              isSoldOut: true,
              price: 10000,
              discountedPrice: 10000,
              promotionName: '',
              promotionLabel: '',
              hasPromotion: false,
            },
          ],
        },
      ];
      (dishApi.getRestaurantMenu as jest.Mock).mockResolvedValue({
        data: {
          isSuccess: true,
          data: mockApiData,
        },
      });
      const result = await dishService.getBranchDishes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: 1,
        restaurantName: '',
        dishName: 'Coffee',
        dishImageUrl: 'img1',
        price: 20000,
        isSoldOut: false,
        discountedPrice: 15000,
        promotionName: 'Sale',
        promotionLabel: '-25%',
        hasPromotion: true,
      }));
      expect(result[1].id).toBe(2);
    });
    it('should throw error when API returns failure', async () => {
      (dishApi.getRestaurantMenu as jest.Mock).mockResolvedValue({
        data: {
          isSuccess: false,
          message: 'Error message',
        },
      });
      await expect(dishService.getBranchDishes(1)).rejects.toThrow('Error message');
    });
    it('should handle empty data', async () => {
      (dishApi.getRestaurantMenu as jest.Mock).mockResolvedValue({
        data: {
          isSuccess: true,
          data: [],
        },
      });
      const result = await dishService.getBranchDishes(1);
      expect(result).toEqual([]);
    });
  });
  describe('toggleSoldOut', () => {
    it('should call API and return data', async () => {
      const mockResponse = { data: { success: true } };
      (dishApi.toggleSoldOut as jest.Mock).mockResolvedValue(mockResponse);
      const result = await dishService.toggleSoldOut(1, 101, true, 0);
      expect(dishApi.toggleSoldOut).toHaveBeenCalledWith(1, 101, true, 0);
      expect(result).toEqual(mockResponse.data);
    });
  });
});
