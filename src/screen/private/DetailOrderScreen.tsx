import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { HeaderDetail } from '../../components/HeaderDetail';
import { CustomerDetailBorder } from '../../components/CustomerDetailBorder';
import { ListFood } from '../../components/ListFood';
import { Border } from '../../components/Border';

export default function DetailOrderScreen() {
  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail />

      <ScrollView className="px-7 -mt-80">
        <CustomerDetailBorder />

        <Border>
          <ListFood />
        </Border>
      </ScrollView>

      <View className="px-4 pb-6 bg-gray-100">
        <TouchableOpacity className="bg-[#226B5D] py-4 rounded-2xl items-center shadow-lg">
          <Text className="text-white text-lg font-semibold">Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
