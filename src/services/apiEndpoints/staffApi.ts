import axiosPrivate from '../axios/privateClient';

export const staffApi = {
  getStaffByRestaurant: (restaurantId: number) => {
    return axiosPrivate.get(`/Staff/restaurant/${restaurantId}`);
  },
};
