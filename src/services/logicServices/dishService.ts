import { dishApi } from '../apiEndpoints/dishApi';

export const dishService = {
  async getBranchDishes(restaurantId: number) {
    const axiosResponse =
      await dishApi.getBranchDishesByRestaurant(restaurantId);

    const response = axiosResponse.data;
    console.log('API Response Data for Dishes:', response);

    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Không lấy được danh sách món');
    }

    return response.data;
  },

  async toggleSoldOut(id: number, isSoldOut: boolean) {
    const response = await dishApi.toggleSoldOut(id, isSoldOut);
    return response.data;
  },
};