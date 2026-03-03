import axiosPublic from '../axios/publicClient';
import axiosPrivate from '../axios/privateClient';

export const restaurantApi = {
  getRestaurantById: (restaurantId: number) => {
    return axiosPublic.get(`/Restaurant/${restaurantId}`);
  },
  updateReceivingOrders: (restaurantId: number, isReceiving: boolean) => {
    return axiosPrivate.put(
      `/Restaurant/${restaurantId}/receiving-orders?isReceiving=${isReceiving}`
    );
  },
};
