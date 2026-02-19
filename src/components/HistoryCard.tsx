import React from 'react';
import { View, Text } from 'react-native';
import { User, Store, TrendingUp } from 'lucide-react-native';

interface Props {
  employee: string;
  restaurant: string;
  totalOrder: number;
  actualCash: number;
  note?: string;
}

export const HistoryCard: React.FC<Props> = ({
  employee,
  restaurant,
  totalOrder,
  actualCash,
  note,
}) => {
  const diff = actualCash - totalOrder;
  const isExcess = diff > 0;

  return (
    <View className="mx-6 mt-4 bg-white rounded-xl shadow-md overflow-hidden border border-gray-300">
      {/* Top Info */}
      <View className="px-4 py-2 border-b border-gray-300">
        <View className="flex-row items-center mb-1">
          <User size={14} color="#226B5D" />
          <Text className="ml-1 text-xs text-[#226B5D]">{employee}</Text>
        </View>

        <View className="flex-row items-center">
          <Store size={14} color="#226B5D" />
          <Text className="ml-1 text-xs text-[#226B5D]">{restaurant}</Text>
        </View>
      </View>

      {/* Body */}
      <View className="p-4">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-700 text-sm">Tổng tiền đơn hàng</Text>
          <Text className="text-sm font-medium">
            {totalOrder.toLocaleString()} VND
          </Text>
        </View>

        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-700 text-sm">Tổng tiền thực tế</Text>
          <Text className="text-sm font-medium">
            {actualCash.toLocaleString()} VND
          </Text>
        </View>

        <View className="flex-row justify-between mb-1 items-center">
          <View className="flex-row items-center">
            <TrendingUp size={14} color={isExcess ? '#2563EB' : '#DC2626'} />
            <Text className="ml-1 text-sm">
              {isExcess ? 'Thừa tiền' : 'Thiếu tiền'}
            </Text>
          </View>

          <Text
            className={`text-sm font-semibold ${
              isExcess ? 'text-blue-600' : 'text-red-600'
            }`}
          >
            {isExcess ? '+' : '-'} {Math.abs(diff).toLocaleString()} VND
          </Text>
        </View>

        {note && (
          <View className="mt-2">
            <Text className="text-gray-700 text-sm">Ghi chú</Text>
            <Text className="text-sm">{note}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
