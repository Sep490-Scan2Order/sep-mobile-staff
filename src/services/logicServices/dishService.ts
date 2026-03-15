import { dishApi } from '../apiEndpoints/dishApi';

export const dishService = {
  async getBranchDishes(restaurantId: number) {
    const axiosResponse = await dishApi.getRestaurantMenu(restaurantId);
    console.log('API Response for getRestaurantMenu:', axiosResponse);
    const response = axiosResponse.data;
    console.log('API Response Data for Dishes:', response);

    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Không lấy được danh sách món');
    }

    // Flatten the nested category structure into a single array of dishes
    const flattenedDishes = (response.data || []).flatMap((category: any) =>
      (category.dishes || []).map((dish: any) => ({
        id: dish.dishId,
        restaurantName: '',
        dishName: dish.dishName,
        dishImageUrl: dish.imageUrl,
        isSelling: !dish.isSoldOut,
        price: dish.price,
        isSoldOut: dish.isSoldOut,
        discountedPrice: dish.discountedPrice,
        promotionName: dish.promotionName,
        promotionLabel: dish.promotionLabel,
        hasPromotion: dish.hasPromotion,
      }))
    );

    console.log('Flattened dishes:', flattenedDishes);
    return flattenedDishes;
  },
async toggleSoldOut(
  restaurantId: number,
  id: number,
  isSoldOut: boolean,
  quantity: number
) {
  const response = await dishApi.toggleSoldOut(
    restaurantId,
    id,
    isSoldOut,
    quantity
  );

  return response.data;
}
};