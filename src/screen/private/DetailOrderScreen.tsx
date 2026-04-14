import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import { HeaderDetail } from '@/components/HeaderDetail';
import { CustomerDetailBorder } from '@/components/CustomerDetailBorder';
import { ListFood } from '@/components/ListFood';
import { Border } from '@/components/Border';
import {
  useNavigation,
  useRoute,
  RouteProp,
  CommonActions,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import {
  confirmCashOrder,
  fetchActiveOrders,
  forceRefresh,
} from '@/store/slices/orderSlice';
import { RootState, AppDispatch } from '@/store';
import { RootStackParamList } from '@/type';
import { AppSnackbar } from '@/components/AppSnackbar';
import { AppModal } from '@/components/AppModal';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useAppModal } from '@/hooks/useAppModal';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DetailOrderScreen'
>;

type RouteProps = RouteProp<RootStackParamList, 'DetailOrderScreen'>;

export default function DetailOrderScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const dispatch = useDispatch<AppDispatch>();

  const { orders, loading } = useSelector((state: RootState) => state.order);
  const restaurantId = useSelector(
    (state: RootState) => state.auth.userInfo?.restaurantId,
  );

  const snackbar = useSnackbar();
  const modal = useAppModal();

  useEffect(() => {
    if (!restaurantId) return;
    dispatch(fetchActiveOrders(restaurantId));
  }, [restaurantId, dispatch]);

  const order = orders.find(o => o.id === route.params.orderId);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Không có đơn hàng</Text>
      </View>
    );
  }

  const handlePayment = () => {
    modal.showConfirm(
      'Xác nhận thanh toán',
      `Xác nhận thanh toán đơn hàng #${order.orderCode}?`,
      async () => {
        try {
          await dispatch(confirmCashOrder(order.id)).unwrap();
          dispatch(forceRefresh());
          snackbar.showSuccess(`Đơn hàng #${order.orderCode} đã thanh toán thành công`);
          navigation.goBack();
        } catch (error) {
          snackbar.showError('Thanh toán thất bại. Vui lòng thử lại.');
        }
      },
      'Thanh toán',
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail onBack={() => navigation.goBack()} />

      <ScrollView className="px-7 -mt-90" style={{ marginTop: -165 }}>
        <CustomerDetailBorder order={order} />

        <Border className="mt-5">
          <FlatList
            data={order.items}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => <ListFood item={item} />}
          />

          <View className="mt-4 pt-4 border-t border-gray-200">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-500 text-sm">Tạm tính</Text>
              <Text className="text-gray-800 text-sm font-medium">
                {order.amount.toLocaleString()} đ
              </Text>
            </View>

            {order.promotionDiscount ? (
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-red-500 text-sm">
                  {order.promotionName || 'Khuyến mãi đơn hàng'}
                </Text>
                <Text className="text-red-500 text-sm font-medium">
                  - {order.promotionDiscount.toLocaleString()} đ
                </Text>
              </View>
            ) : null}

            <View className="flex-row justify-between items-center mt-1">
              <Text className="text-gray-900 text-base font-bold">Tổng thanh toán</Text>
              <Text className="text-[#226B5D] text-xl font-bold">
                {order.finalAmount?.toLocaleString()} đ
              </Text>
            </View>
          </View>
        </Border>
      </ScrollView>

      <View className="px-4 pb-6 bg-gray-100">
        {order.status === 0 && order.type === 'Cash' && (
          <TouchableOpacity
            onPress={handlePayment}
            className="bg-[#226B5D] py-4 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white text-lg font-semibold">Thanh toán</Text>
          </TouchableOpacity>
        )}
      </View>

      <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
      <AppModal {...modal.modalConfig} onDismiss={modal.hideModal} />
    </View>
  );
}
