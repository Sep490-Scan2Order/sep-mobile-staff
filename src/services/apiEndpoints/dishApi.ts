import axiosPrivate from '../axios/privateClient';

export const dishApi = {
  getBranchDishesByRestaurant: (restaurantId: number) => {
    return axiosPrivate.get(
      `/BranchDishConfig/restaurants/${restaurantId}/branch-dishes`
    );
  },
  getRestaurantMenu: (restaurantId: number) => {
    return axiosPrivate.get(
      `/Restaurant/${restaurantId}/menu`
    );
  },
toggleSoldOut: (
    restaurantId: number,
    id: number,
    isSoldOut: boolean,
    quantity: number
  ) => {
    return axiosPrivate.put(
      `/BranchDishConfig/toggle-sold-out/${restaurantId}/${id}?isSoldOut=${isSoldOut}&quantity=${quantity}`
    );
  },
  
};