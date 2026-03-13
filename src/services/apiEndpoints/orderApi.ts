import axiosPrivate from '../axios/privateClient';

export const orderApi = {
  getActiveOrders: (restaurantId: number) => {
    return axiosPrivate.get(
      `/Order/kds/active-orders/${restaurantId}`
    );
  },
  updateOrderStatus: (orderId: string, newStatus: number) => {
    return axiosPrivate.patch(
      `/Order/update-status/${orderId}?newStatus=${newStatus}`
    );
  },
};