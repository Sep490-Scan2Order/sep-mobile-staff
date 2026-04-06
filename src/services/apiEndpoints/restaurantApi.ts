import axiosPublic from '@/services/axios/publicClient';
import axiosPrivate from '@/services/axios/privateClient';

export const restaurantApi = {
  getRestaurantById: (restaurantId: number) => {
    return axiosPublic.get(`/Restaurant/${restaurantId}`);
  },
  updateReceivingOrders: (restaurantId: number, isReceivingOrders: boolean) => {
    return axiosPrivate.put(
      `/Restaurant/${restaurantId}/receiving-orders?isReceivingOrders=${isReceivingOrders}`
    );
  },
  updateOpeningStatus: (restaurantId: number, isOpened: boolean) => {
    return axiosPrivate.put(
      `/Restaurant/${restaurantId}/opening-status?isOpened=${isOpened}`
    );
  },
};
