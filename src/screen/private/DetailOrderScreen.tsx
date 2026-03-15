import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import { HeaderDetail } from '../../components/HeaderDetail';
import { CustomerDetailBorder } from '../../components/CustomerDetailBorder';
import { ListFood } from '../../components/ListFood';
import { Border } from '../../components/Border';
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigatorScreenParams,
  CommonActions,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import {
  confirmCashOrder,
  fetchPendingCashOrders,
  forceRefresh,
  Order,
} from '../../store/slices/orderSlice';
import { RootState, AppDispatch } from '../../store';

type BottomTabParamList = {
  KDS: undefined;
  Foods: undefined;
  Orders: undefined;
  Menu: undefined;
  CheckIn: undefined;
};

type RootStackParamList = {
  BottomTabs: NavigatorScreenParams<BottomTabParamList>;
  DetailOrderScreen: { orderId: string };
  DetailPaymentScreen: { order: Order };
};
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

  useEffect(() => {
    dispatch(fetchPendingCashOrders());
  }, [dispatch]);

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

  const handlePayment = async () => {
    try {
      await dispatch(confirmCashOrder(order.id)).unwrap();

      Alert.alert(
        'Thanh toán thành công',
        `Đơn hàng #${order.orderCode} đã được thanh toán`,
      );

      // Refresh UI - SignalR sẽ gửi OrderConfirmed event để update danh sách
      dispatch(forceRefresh());

      // Quay lại KDS screen
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Thanh toán thất bại');
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail />

      <ScrollView className="px-7 -mt-90" style={{ marginTop: -165 }}>
        <CustomerDetailBorder order={order} />

        <Border className="mt-5">
          <FlatList
            data={order.items}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => <ListFood item={item} />}
          />

          <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <Text className="text-gray-600 text-sm">Tổng tiền đơn hàng</Text>

            <Text className="text-[#226B5D] text-lg font-semibold">
              {order.amount.toLocaleString()} đ
            </Text>
          </View>
        </Border>
      </ScrollView>

      <View className="px-4 pb-6 bg-gray-100">
        <TouchableOpacity
          onPress={handlePayment}
          className="bg-[#226B5D] py-4 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-white text-lg font-semibold">Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
