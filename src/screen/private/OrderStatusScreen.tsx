import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  StatusBar,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchRestaurantById,
  toggleReceivingOrders,
  toggleOpeningStatus,
} from '@/store/slices/restaurantSlice';
import { Header } from '@/components/Header';
import { Clock, Store, ShoppingBag } from 'lucide-react-native';
import { useSnackbar } from '@/hooks/useSnackbar';
import { AppSnackbar } from '@/components/AppSnackbar';
export const OrderStatusScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const restaurantId = userInfo?.restaurantId || 0;
  const { restaurant, loading, error } = useSelector(
    (state: RootState) => state.restaurant,
  );
  const snackbar = useSnackbar();
  useEffect(() => {
    if (restaurantId > 0) {
      dispatch(fetchRestaurantById(restaurantId));
    }
  }, [dispatch, restaurantId]);
  const handleToggleReceiving = async () => {
    if (restaurant && restaurantId > 0) {
      const newValue = !restaurant.isReceivingOrders;
      try {
        await dispatch(
          toggleReceivingOrders({
            restaurantId: restaurant.id,
            isReceiving: newValue,
          }),
        ).unwrap();
        snackbar.showSuccess(
          newValue ? 'Đã bật nhận đơn hàng' : 'Đã tắt nhận đơn hàng'
        );
      } catch (err: any) {
        snackbar.showError(err?.message || 'Không thể cập nhật trạng thái nhận đơn');
      }
    }
  };
  const handleToggleOpening = async () => {
    if (restaurant && restaurantId > 0) {
      const newValue = !restaurant.isOpened;
      try {
        await dispatch(
          toggleOpeningStatus({
            restaurantId: restaurant.id,
            isOpened: newValue,
          }),
        ).unwrap();
        snackbar.showSuccess(
          newValue ? 'Đã mở cửa hàng' : 'Đã đóng cửa hàng'
        );
      } catch (err: any) {
        snackbar.showError(err?.message || 'Không thể cập nhật trạng thái cửa hàng');
      }
    }
  };
  if (restaurantId === 0) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <Store size={64} color="#94a3b8" />
        <Text className="text-slate-500 text-center font-semibold mt-4 text-lg">
          Tài khoản của bạn chưa được gán cho nhà hàng nào.
        </Text>
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-6">
        <Text className="text-rose-500 text-center font-bold text-lg">Lỗi</Text>
        <Text className="text-slate-600 text-center mt-2">{error}</Text>
        <TouchableOpacity 
          className="mt-6 bg-teal-600 px-6 py-3 rounded-full"
          onPress={() => dispatch(fetchRestaurantById(restaurantId))}
        >
          <Text className="text-white font-bold">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-teal-900">
      <StatusBar barStyle="light-content" backgroundColor="#134e4a" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />
        <View className="flex-1 bg-slate-50 rounded-t-[40px] mt-4 overflow-hidden">
          {loading && !restaurant ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#0f766e" />
              <Text className="mt-4 text-slate-400 font-medium italic">Đang tải dữ liệu...</Text>
            </View>
          ) : !restaurant ? (
            <View className="flex-1 justify-center items-center p-10">
              <Store size={48} color="#cbd5e1" />
              <Text className="text-slate-400 font-bold text-center mt-4 text-lg">
                Không tìm thấy thông tin nhà hàng
              </Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {}
              <View className="mx-6 mt-8 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-teal-800 text-2xl font-black uppercase tracking-tight">
                      {restaurant.restaurantName}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Clock size={14} color="#64748b" />
                      <Text className="text-slate-500 ml-1 text-sm font-medium">
                        {restaurant.openTime || '--:--'} - {restaurant.closeTime || '--:--'}
                      </Text>
                    </View>
                  </View>
                  <View className={`px-4 py-2 rounded-2xl ${restaurant.isOpened ? 'bg-teal-100' : 'bg-slate-100'}`}>
                    <Text className={`font-bold ${restaurant.isOpened ? 'text-teal-700' : 'text-slate-500'}`}>
                      {restaurant.isOpened ? 'MỞ CỬA' : 'ĐÓNG CỬA'}
                    </Text>
                  </View>
                </View>
                <Text className="text-slate-400 mt-4 text-sm leading-5">
                  {restaurant.address}
                </Text>
              </View>
              {}
              <View className="px-6 mt-8">
                <Text className="text-slate-800 text-lg font-black ml-1 mb-4">Trạng thái vận hành</Text>
                <View className="gap-y-4">
                  {}
                  <View className="bg-white rounded-3xl p-5 flex-row items-center justify-between shadow-sm border border-slate-100">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${restaurant.isOpened ? 'bg-teal-600' : 'bg-slate-200'}`}>
                        <Store size={24} color={restaurant.isOpened ? 'white' : '#64748b'} />
                      </View>
                      <View className="ml-4">
                        <Text className="text-slate-800 font-bold text-base">Trạng thái cửa hàng</Text>
                        <Text className="text-slate-400 text-xs mt-0.5">Bật để khách hàng có thể xem menu</Text>
                      </View>
                    </View>
                    <Switch
                      value={restaurant.isOpened || false}
                      onValueChange={handleToggleOpening}
                      trackColor={{ false: '#e2e8f0', true: '#14b8a6' }}
                      thumbColor="#fff"
                    />
                  </View>
                  {}
                  <View className="bg-white rounded-3xl p-5 flex-row items-center justify-between shadow-sm border border-slate-100">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${restaurant.isReceivingOrders ? 'bg-orange-500' : 'bg-slate-200'}`}>
                        <ShoppingBag size={24} color={restaurant.isReceivingOrders ? 'white' : '#64748b'} />
                      </View>
                      <View className="ml-4">
                        <Text className="text-slate-800 font-bold text-base">Nhận đơn hàng mới</Text>
                        <Text className="text-slate-400 text-xs mt-0.5">Khách có thể đặt món ngay bây giờ</Text>
                      </View>
                    </View>
                    <Switch
                      value={restaurant.isReceivingOrders || false}
                      onValueChange={handleToggleReceiving}
                      trackColor={{ false: '#e2e8f0', true: '#f97316' }}
                      thumbColor="#fff"
                      disabled={!restaurant.isOpened}
                    />
                  </View>
                </View>
                {}
                <View className="mt-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-row items-center">
                  <View className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center">
                     <Clock size={24} color="#64748b" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-slate-800 font-bold text-base">Giờ hoạt động hệ thống</Text>
                    <Text className="text-slate-500 text-sm">
                      {restaurant.openTime || '--:--'} đến {restaurant.closeTime || '--:--'} hàng ngày
                    </Text>
                  </View>
                </View>
                <View className="mt-8 p-4 bg-teal-50 rounded-2xl border border-teal-100 flex-row items-center">
                  <Text className="text-teal-700 text-xs leading-4 flex-1 italic text-center">
                    Bạn có thể đóng cửa hàng hoặc dừng nhận đơn bằng các công tắc phía trên. Để thay đổi giờ hoạt động chính thức, vui lòng liên hệ quản lý.
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
      <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
    </View>
  );
};
export default OrderStatusScreen;
