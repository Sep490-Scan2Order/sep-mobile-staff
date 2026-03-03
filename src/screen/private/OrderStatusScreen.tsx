import React, { useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchRestaurantById,
  toggleReceivingOrders,
} from '../../store/slices/restaurantSlice';
import { HeaderDetail } from '../../components/HeaderDetail';
import { RestaurantCard } from '../../components/RestaurantCard';
import { OrderStatusCard } from '../../components/OrderStatusCard';

const RESTAURANT_ID = 58;

export const OrderStatusScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { restaurant, loading, error } = useSelector(
    (state: RootState) => state.restaurant,
  );

  useEffect(() => {
    // Fetch restaurant data when component mounts
    dispatch(fetchRestaurantById(RESTAURANT_ID));
  }, [dispatch]);

  const handleToggle = () => {
    if (restaurant) {
      dispatch(
        toggleReceivingOrders({
          restaurantId: restaurant.id,
          isReceiving: !restaurant.isReceivingOrders,
        }),
      );
    }
  };
  console.log('toggleReceivingOrders:', toggleReceivingOrders);

  // if (loading) {
  //   return (
  //     <View className="flex-1 bg-gray-100 justify-center items-center">
  //       <ActivityIndicator size="large" color="#226B5D" />
  //     </View>
  //   );
  // }

  if (error) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center p-4">
        <Text className="text-red-600 text-center">Lỗi: {error}</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-gray-600">Không tìm thấy thông tin nhà hàng</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail title="Trạng thái đơn hàng" heightClass="h-2/6" />

      <ScrollView className="flex-1" style={{ marginTop: -120 }}>
        <RestaurantCard
          name={restaurant.restaurantName}
          address={restaurant.address}
          openTime={restaurant.isOpened ? 'Đang mở' : 'Đang đóng'}
          image={restaurant.image}
        />

        <OrderStatusCard
          isOpen={restaurant.isReceivingOrders}
          isLoading={loading}
          onToggle={handleToggle}
        />

        <View className="h-28" />
      </ScrollView>
    </View>
  );
};
export default OrderStatusScreen;
