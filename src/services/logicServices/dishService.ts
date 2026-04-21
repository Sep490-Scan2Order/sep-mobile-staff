import { dishApi } from '@/services/apiEndpoints/dishApi';
export const dishService = {
  async getBranchDishes(restaurantId: number) {
    const axiosResponse = await dishApi.getRestaurantMenu(restaurantId);
    const response = axiosResponse.data;
    if (!response?.isSuccess) {
      throw new Error(response?.message || 'Không lấy được danh sách món');
    }
    const flattenedDishes = (response.data || []).flatMap((category: any) =>
      (category.dishes || []).map((dish: any) => ({
        id: dish.dishId,
        restaurantName: '',
        dishName: dish.dishName,
        dishImageUrl: dish.imageUrl,
        isSelling: dish.isSelling,
        price: dish.price,
        isSoldOut: dish.isSoldOut,
        discountedPrice: dish.discountedPrice,
        promotionName: dish.promotionName,
        promotionLabel: dish.promotionLabel,
        hasPromotion: dish.hasPromotion,
        quantity: dish.dishAvailabilityStock,
        description: dish.description ?? null,
        type: dish.type ?? 0,
        promoType: dish.promoType ?? 0,
        expiredAt: dish.expiredAt ?? null,
        comboItems: dish.comboItems ?? [],
        isCombo: Array.isArray(dish.comboItems) && dish.comboItems.length > 0,
      }))
    );
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