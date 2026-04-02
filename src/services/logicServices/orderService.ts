import { orderApi, scanQrApi } from '@/services/apiEndpoints/orderApi';

export const orderService = {
  async getActiveOrders(restaurantId: number) {
    const axiosResponse = await orderApi.getActiveOrders(restaurantId);
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

    return response.data;
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

  async readyForPickup(orderCode: number) {
    const axiosResponse = await orderApi.readyForPickup(orderCode);
    const response = axiosResponse.data;

    if (!response?.success) {
      throw new Error(response?.message || 'Generate audio failed');
    }

    return response;
  },

  async confirmPickupTime(orderId: string, confirmedPickupAt: string) {
    const axiosResponse = await orderApi.confirmPickupTime(orderId, confirmedPickupAt);
    const response = axiosResponse.data;
    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Xác nhận giờ nhận hàng thất bại');
    }

    return response.data;
  },

  async scanOrderQr(qrContent: string, orderNumber: number): Promise<string> {
    try {
      const audioUrl = await scanQrApi(qrContent, orderNumber);
      return audioUrl;
    } catch (error) {
      throw error;
    }
  }
};