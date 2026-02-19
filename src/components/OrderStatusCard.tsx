import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Power } from 'lucide-react-native';

interface Props {
  isOpen: boolean;
  onToggle?: () => void;
}

export const OrderStatusCard: React.FC<Props> = ({ isOpen, onToggle }) => {
  return (
    <View className="mx-5 mt-6 bg-green-600 rounded-2xl p-6 items-center">
      <View className="items-center">
        <Power size={60} color="white" />
        <Text className="text-white mt-3 text-base font-semibold">
          Trạng thái nhận đơn
        </Text>
      </View>

      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        className="mt-6 bg-white/90 w-full py-3 rounded-lg items-center"
      >
        <Text className="text-green-700 font-semibold">
          {isOpen ? 'Tắt nhận đơn hàng' : 'Bật nhận đơn hàng'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
