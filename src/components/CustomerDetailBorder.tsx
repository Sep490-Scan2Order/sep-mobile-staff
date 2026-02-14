import React from 'react';
import { View, Text } from 'react-native';
import { Phone, Hash, Calendar, MapPin } from 'lucide-react-native';

export const CustomerDetailBorder = () => {
  return (
    <View className="bg-white/20 border border-white/30 rounded-3xl p-6 mb-5">
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
        <Text className="text-lg font-bold text-white">0123456789</Text>

        <Text className="text-lg font-bold text-white">ORD-2026-001</Text>
      </View>

      {/* Divider */}
      <View className="border-t border-white/30 pt-4 mb-4">
        <View className="flex-row items-center">
          <Calendar size={18} color="#FFFFFF" />
          <Text className="ml-3 text-base text-white">
            Ngày tạo: 13/02/2026 - 14:30
          </Text>
        </View>
      </View>

      {/* Table */}
      <View className="flex-row items-center">
        <MapPin size={18} color="#FFFFFF" />
        <Text className="ml-3 text-base text-white">Tại bàn: Bàn 05</Text>
      </View>
    </View>
  );
};
