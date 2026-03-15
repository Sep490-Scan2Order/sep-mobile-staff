import axiosPrivate from '../axios/privateClient';

export const orderApi = {
  getActiveOrders: (restaurantId: number) => {
    return axiosPrivate.get(
      `/Order/kds/active-orders/${restaurantId}`
    );
  },
  updateOrderStatus: (orderId: string, newStatus: number) => {
    return axiosPrivate.put(
      `/Order/update-status/${orderId}?newStatus=${newStatus}`
    );
  },
  listOrders: (cartId: string) => {
    return axiosPrivate.get(
      `/Order/cart/${cartId}`
    );
  },
   getPendingCashOrders: () => {
    return axiosPrivate.get(`/Order/cash/pending-confirm`);
  },
  confirmCashOrder: (orderId: string) => {
  return axiosPrivate.post(
    `/Order/cash/${orderId}/confirm`
  );
},
readyForPickup: (orderCode: number) => {
    return axiosPrivate.post(`/Order/ready-for-pickup/${orderCode}`);
  }
};