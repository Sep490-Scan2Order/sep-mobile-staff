import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, DollarSign, Phone, MoreVertical } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface SDKTableProps {
  statusFilter: number;
}

export const SDKTable: React.FC<SDKTableProps> = ({ statusFilter }) => {
  const { orders } = useSelector((state: RootState) => state.order);

  const filteredOrders =
    statusFilter === -1
      ? orders
      : orders.filter(o => o.status === statusFilter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const datePart = date.toLocaleDateString();
    const timePart = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${datePart} - ${timePart}`;
  };

  return (
    <ScrollView className="flex-1 px-4 py-4">
      {filteredOrders.map(order => (
        <View
          key={order.id}
          className="bg-gray-100 rounded-xl border-2 border-[#226B5D] overflow-hidden mb-6"
        >
          {/* Header */}
          <View className="flex-row items-center px-4 py-4 border-b border-dashed border-gray-400">
            <Phone size={20} color="#226B5D" />

            <Text className="flex-1 ml-3 text-base text-gray-700">
              {order.phone || 'Không có SĐT'}

              {order.status === 1 && (
                <Text className="text-white bg-yellow-500 px-2 py-1 ml-2">
                  Đang làm
                </Text>
              )}

              {order.status === 2 && (
                <Text className="text-white bg-green-500 px-2 py-1 ml-2">
                  Đã xong
                </Text>
              )}

              {order.status === 3 && (
                <Text className="text-white bg-blue-500 px-2 py-1 ml-2">
                  Đã giao
                </Text>
              )}
            </Text>

            <MoreVertical size={18} color="#226B5D" />
          </View>

          {/* Middle */}
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

          {/* Button */}
          <TouchableOpacity className="py-4 items-center border-t border-dashed border-gray-400">
            <Text className="text-[#226B5D] text-base font-semibold">
              Bắt đầu làm
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};
