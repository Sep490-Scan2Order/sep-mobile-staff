import { restaurantApi } from '@/services/apiEndpoints/restaurantApi';

export const restaurantService = {
  async getRestaurantById(restaurantId: number) {
    const axiosResponse = await restaurantApi.getRestaurantById(restaurantId);

    const response = axiosResponse.data;

    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Không lấy được thông tin nhà hàng');
    }

    return response.data;
  },

  async updateReceivingOrders(restaurantId: number, isReceiving: boolean) {
    const axiosResponse = await restaurantApi.updateReceivingOrders(
      restaurantId,
      isReceiving
    );

    const response = axiosResponse.data;

    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Không cập nhật được trạng thái');
    }

    return response.data;
  },
};
