import axiosPublic from '@/services/axios/publicClient';
import axiosPrivate from '@/services/axios/privateClient';

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
