import { orderApi } from '../apiEndpoints/orderApi';

export const orderService = {
  async getActiveOrders(restaurantId: number) {
    const axiosResponse = await orderApi.getActiveOrders(restaurantId);
console.log('Axios Response:', axiosResponse); // Debug log để kiểm tra dữ liệu trả về từ API
    const response = axiosResponse.data;

    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Không lấy được danh sách order');
    }

    return response.data;
  },

  async updateOrderStatus(orderId: string, newStatus: number) {
    const axiosResponse = await orderApi.updateOrderStatus(orderId, newStatus);
    const response = axiosResponse.data;

    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Cập nhật trạng thái thất bại');
    }

    return response.data; // Thường trả về true/false hoặc object order đã update
  },

  async listOrders(cartId: string) {
    const axiosResponse = await orderApi.listOrders(cartId);
    const response = axiosResponse.data;

    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Không lấy được danh sách order');
    }

    return response.data;
  },
  async getPendingCashOrders() {
    const axiosResponse = await orderApi.getPendingCashOrders();
    const response = axiosResponse.data;
    console.log('Axios Response for Pending Cash Orders:', axiosResponse); // Debug log để kiểm tra dữ liệu trả về từ API

    if (!response?.isSuccess) {
      throw new Error(
        response?.message || 'Không lấy được danh sách order chờ xác nhận'
      );
    }

    return response.data;
  },

  async confirmCashOrder(orderId: string) {
  const axiosResponse = await orderApi.confirmCashOrder(orderId);
  const response = axiosResponse.data;

  if (!response?.isSuccess) {
    throw new Error(response?.message || 'Xác nhận thanh toán thất bại');
  }

  return response.data;
},
};