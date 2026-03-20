import React from 'react';
import { View, Text } from 'react-native';
import { Phone, Hash, Calendar, MapPin, CreditCard } from 'lucide-react-native';

interface Props {
  order: {
    phone: string;
    orderCode: string | number;
    createdAt: string;
    tableName?: string;
    type?: string;
  };
}

export const CustomerDetailBorder = ({ order }: Props) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <View
      className="bg-white/20 border border-white/30 rounded-3xl p-6 "
      style={{ marginBottom: 70 }}
    >
      {/* Row title */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-row items-center">
          <Phone size={20} color="#FFFFFF" />
          <Text className="ml-3 text-base text-white font-semibold">
            Số điện thoại
          </Text>
        </View>

        <View className="flex-row items-center">
          <Hash size={20} color="#FFFFFF" />
          <Text className="ml-3 text-base text-white font-semibold">
            Mã đơn hàng
          </Text>
        </View>
      </View>

      {/* Row value */}
      <View className="flex-row justify-between mb-4">
        <Text className="text-lg font-bold text-white">
          {order?.phone || '---'}
        </Text>

        <Text className="text-lg font-bold text-white">
          {order?.orderCode || '---'}
        </Text>
      </View>

      {/* Divider */}
      <View className="border-t border-white/30 pt-4 mb-4">
        <View className="flex-row items-center">
          <Calendar size={18} color="#FFFFFF" />
          <Text className="ml-3 text-base text-white">
            Ngày tạo: {formatDate(order?.createdAt) || '---'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mt-4">
        <CreditCard size={18} color="#FFFFFF" />
        <Text className="ml-3 text-base text-white">
          Thanh toán: {order?.type === 'Cash' ? 'Tiền mặt' : 'Chuyển khoản'}
        </Text>
      </View>
    </View>
  );
};
