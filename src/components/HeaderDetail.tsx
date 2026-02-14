import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

export const HeaderDetail = () => {
  return (
    <View className="bg-[#226B5D] pt-14 px-4 rounded-b-3xl h-2/4">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity>
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-white text-lg font-semibold">
          Chi tiết đơn hàng
        </Text>
      </View>

      <View className="items-center">
        <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full">
          <CheckCircle size={16} color="white" />
          <Text className="text-white text-sm ml-2">Thanh toán thành công</Text>
        </View>
      </View>
    </View>
  );
};
