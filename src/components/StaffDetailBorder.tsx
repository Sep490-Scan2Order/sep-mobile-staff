import React from 'react';
import { View, Text } from 'react-native';
import { Phone, Hash } from 'lucide-react-native';

export const StaffDetailBorder = () => {
  return (
    <View
      className="bg-white/20 border border-white/30 rounded-3xl p-6  "
      style={{ marginTop: -260, marginLeft: 24, marginRight: 24 }}
    >
      {/* Row title */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-row items-center">
          <Phone size={20} color="#FFFFFF" />
          <Text className="ml-3 text-base text-white font-semibold">
            Tên nhân viên
          </Text>
        </View>

        <View className="flex-row items-center">
          <Hash size={20} color="#FFFFFF" />
          <Text className="ml-3 text-base text-white font-semibold">
            Ngày báo cáo
          </Text>
        </View>
      </View>

      {/* Row value */}
      <View className="flex-row justify-between mb-4">
        <Text className="text-lg font-bold text-white">Nguyen Van A</Text>

        <Text className="text-lg font-bold text-white">12/11/2025</Text>
      </View>

      {/* Divider */}
      <View className="border-t border-white/30 pt-4 mb-4">
        <View className="flex-row justify-between mb-4">
          <View className="flex-row items-center">
            <Phone size={20} color="#FFFFFF" />
            <Text className="ml-3 text-base text-white font-semibold">
              Nhà hàng
            </Text>
          </View>
        </View>

        {/* Row value */}
        <View className="flex-row justify-between mb-4">
          <Text className="text-lg font-bold text-white">Nguyen Van A</Text>
        </View>
      </View>
    </View>
  );
};
