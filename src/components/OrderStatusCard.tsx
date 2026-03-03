import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Power } from 'lucide-react-native';

interface Props {
  isOpen: boolean;
  isLoading?: boolean;
  onToggle?: () => void;
}

export const OrderStatusCard: React.FC<Props> = ({
  isOpen,
  isLoading = false,
  onToggle,
}) => {
  const bgColor = isOpen ? 'bg-green-600' : 'bg-red-600';
  const buttonText = isOpen ? 'Tắt nhận đơn hàng' : 'Bật nhận đơn hàng';
  const textColor = isOpen ? 'text-green-700' : 'text-red-700';

  return (
    <View className={`mx-5 mt-6 ${bgColor} rounded-2xl p-6 items-center`}>
      <View className="items-center">
        <Power size={60} color="white" />
        <Text className="text-white mt-3 text-base font-semibold">
          Trạng thái nhận đơn
        </Text>
        <Text className="text-white/80 text-xs mt-2">
          {isOpen ? 'Đang nhận đơn hàng' : 'Không nhận đơn hàng'}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onToggle}
        disabled={isLoading}
        activeOpacity={0.8}
        className="mt-6 bg-white/90 w-full py-3 rounded-lg items-center flex-row justify-center"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isOpen ? '#15803d' : '#dc2626'} />
        ) : (
          <Text className={`${textColor} font-semibold`}>{buttonText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
