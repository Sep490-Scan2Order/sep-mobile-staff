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
  async updateReceivingOrders(restaurantId: number, isReceivingOrders: boolean) {
    const axiosResponse = await restaurantApi.updateReceivingOrders(
      restaurantId,
      isReceivingOrders
    );
    const response = axiosResponse.data;
    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Không cập nhật được trạng thái nhận đơn');
    }
    return response.data;
  },
  async updateOpeningStatus(restaurantId: number, isOpened: boolean) {
    const axiosResponse = await restaurantApi.updateOpeningStatus(
      restaurantId,
      isOpened
    );
    const response = axiosResponse.data;
    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Không cập nhật được trạng thái đóng/mở');
    }
    return response.data;
  },
};
