import axiosPrivate from '../axios/privateClient';

export const dishApi = {
  getBranchDishesByRestaurant: (restaurantId: number) => {
    return axiosPrivate.get(
      `/BranchDishConfig/restaurants/${restaurantId}/branch-dishes`
    );
  },
    toggleSoldOut: (id: number, isSoldOut: boolean) => {
    return axiosPrivate.put(
      `/BranchDishConfig/toggle-sold-out/${id}?isSoldOut=${isSoldOut}`
    );
  },
};