import React, { useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchRestaurantById,
  toggleReceivingOrders,
} from '../../store/slices/restaurantSlice';
import { Header } from '../../components/Header';
import { RestaurantCard } from '../../components/RestaurantCard';
import { OrderStatusCard } from '../../components/OrderStatusCard';

const RESTAURANT_ID = 58;

export const OrderStatusScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { restaurant, loading, error } = useSelector(
    (state: RootState) => state.restaurant,
  );

  useEffect(() => {
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

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <Text className="text-red-500 text-center font-bold">Lỗi: {error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-teal-700">
      <StatusBar barStyle="light-content" backgroundColor="#134e4a" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />

        <View className="flex-1 bg-white">
          {loading && !restaurant ? (
             <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0f766e" />
             </View>
          ) : !restaurant ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-400 font-bold">Không tìm thấy thông tin nhà hàng</Text>
            </View>
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 24 }}>
              <View style={{ height: 50 }} />
              <View className="px-5">
                <RestaurantCard
                  name={restaurant.restaurantName}
                  address={restaurant.address}
                  openTime={restaurant.isOpened ? 'Đang mở' : 'Đang đóng'}
                  image={restaurant.image}
                />

                <View className="mt-6">
                  <OrderStatusCard
                    isOpen={restaurant.isReceivingOrders}
                    isLoading={loading}
                    onToggle={handleToggle}
                  />
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default OrderStatusScreen;
