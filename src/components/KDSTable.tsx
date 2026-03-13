import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  Calendar,
  DollarSign,
  Phone,
  MoreVertical,
  Search,
  X,
} from 'lucide-react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Order, updateOrderStatus } from '../store/slices/orderSlice';

interface SDKTableProps {
  statusFilter: number;
}

type RootStackParamList = {
  DetailOrderScreen: { order: Order };
};

export const SDKTable: React.FC<SDKTableProps> = ({ statusFilter }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();

  const { orders } = useSelector((state: RootState) => state.order);

  const [searchText, setSearchText] = useState('');

  const ORDER_STATUS_LABEL: Record<number, string> = {
    0: 'Thanh toán',
    1: 'Nhận đơn',
    2: 'Đã hoàn thành',
    3: 'Giao hàng',
    4: 'Đã giao',
    5: 'Đã hủy',
  };

  const getNextStatus = (status: number) => {
    switch (status) {
      case 1:
        return 2;
      case 2:
        return 3;
      case 3:
        return 4;
      default:
        return status;
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return { text: 'Chờ nhận', color: 'bg-yellow-500' };
      case 2:
        return { text: 'Đang làm', color: 'bg-orange-500' };
      case 3:
        return { text: 'Hoàn thành', color: 'bg-green-500' };
      case 4:
        return { text: 'Đã giao', color: 'bg-blue-500' };
      case 0:
        return { text: 'Chưa thanh toán', color: 'bg-red-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const datePart = date.toLocaleDateString();
    const timePart = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${datePart} - ${timePart}`;
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const filteredOrders = orders
    .filter(order => isToday(order.createdAt))
    .filter(order =>
      statusFilter === -1 ? true : order.status === statusFilter,
    )
    .filter(order => {
      if (!searchText.trim()) return true;

      const keyword = searchText.toLowerCase();
      const orderCodeFull = `ord-${order.orderCode}`;

      return (
        order.phone?.toLowerCase().includes(keyword) ||
        order.orderCode?.toString().includes(keyword) ||
        orderCodeFull.includes(keyword) ||
        order.items?.some(item => item.name?.toLowerCase().includes(keyword))
      );
    })
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  console.log('Filtered Orders:', filteredOrders);

  return (
    <View className="flex-1">
      {/* SEARCH BAR */}

      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-[#E8F3F0] border border-[#226B5D] rounded-xl px-3 py-2">
          <Search size={18} style={{ color: '#226B5D' }} />

          <TextInput
            placeholder="Tìm món ăn / SĐT / mã đơn..."
            placeholderTextColor="#6b7280"
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 ml-2 text-gray-700"
          />

          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <X size={18} style={{ color: '#226B5D' }} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ORDER LIST */}

      <ScrollView className="flex-1 px-4 py-4">
        {filteredOrders.map(order => {
          const badge = getStatusBadge(order.status);

          return (
            <View
              key={order.id}
              className="bg-gray-100 rounded-xl border-2 border-[#226B5D] overflow-hidden mb-6"
            >
              {/* HEADER */}

              <View className="flex-row items-center px-4 py-4 border-b border-dashed border-gray-400">
                <Phone size={20} color="#226B5D" />

                <Text className="flex-1 ml-3 text-base text-gray-700">
                  {order.phone || 'Không có SĐT'}

                  {badge.text !== '' && (
                    <Text
                      className={`text-white px-2 py-1 ml-2 rounded ${badge.color}`}
                    >
                      {badge.text}
                    </Text>
                  )}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('DetailOrderScreen', {
                      order: order,
                    })
                  }
                >
                  <MoreVertical size={18} color="#226B5D" />
                </TouchableOpacity>
              </View>

              {/* BODY */}

              <View className="flex-row">
                <View className="flex-1 justify-center px-3 py-4 border-r border-gray-300">
                  <Text className="text-lg text-gray-700 font-semibold">
                    ORD-{order.orderCode}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center px-3 py-3 border-b border-gray-300">
                    <Calendar size={16} color="#777" />

                    <Text className="ml-2 text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>

                  <View className="flex-row items-center px-3 py-3">
                    <DollarSign size={16} color="#777" />

                    <Text className="ml-2 text-sm text-gray-600">
                      {order.amount.toLocaleString()} đ
                    </Text>
                  </View>
                </View>
              </View>

              {/* BUTTON */}

              <TouchableOpacity
                className="py-4 items-center border-t border-dashed border-gray-400"
                onPress={() => {
                  const newStatus = getNextStatus(order.status);

                  dispatch(
                    updateOrderStatus({
                      orderId: order.id,
                      newStatus,
                    }),
                  );
                }}
              >
                <Text className="text-[#226B5D] text-base font-semibold">
                  {ORDER_STATUS_LABEL[order.status]}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {filteredOrders.length === 0 && (
          <View className="items-center mt-20">
            <Text className="text-gray-400 text-base">
              Không tìm thấy kết quả
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
