import React from 'react';
import { View, Text } from 'react-native';
import { User, Store, TrendingUp } from 'lucide-react-native';

interface Props {
  employee: string;
  restaurant: string;
  totalCashOrder: number;
  totalTransferOrder: number;
  totalRefundAmount: number;
  expectedCashAmount: number;
  actualCashAmount: number;
  difference: number;
  note?: string;
}

export const HistoryCard: React.FC<Props> = ({
  employee,
  restaurant,
  totalCashOrder,
  totalTransferOrder,
  totalRefundAmount,
  expectedCashAmount,
  actualCashAmount,
  difference,
  note,
}) => {
  const isExcess = difference > 0;
  const isMatch = difference === 0;

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
          <Text className="text-gray-700 text-sm">Doanh thu tiền mặt</Text>
          <Text className="text-sm font-medium">
            {totalCashOrder.toLocaleString()} VND
          </Text>
        </View>

        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-700 text-sm">Doanh thu CK</Text>
          <Text className="text-sm font-medium">
            {totalTransferOrder.toLocaleString()} VND
          </Text>
        </View>

        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-700 text-sm italic">Hoàn tiền</Text>
          <Text className="text-sm font-medium text-orange-600">
            -{totalRefundAmount.toLocaleString()} VND
          </Text>
        </View>

        <View className="flex-row justify-between mb-1 pt-1 border-t border-gray-100">
          <Text className="text-gray-900 text-sm font-semibold">Dự kiến trong két</Text>
          <Text className="text-sm font-bold">
            {expectedCashAmount.toLocaleString()} VND
          </Text>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-900 text-sm font-semibold">Thực tế nhập</Text>
          <Text className="text-sm font-bold">
            {actualCashAmount.toLocaleString()} VND
          </Text>
        </View>

        <View className="flex-row justify-between mb-1 items-center bg-gray-50 p-2 rounded-lg">
          <View className="flex-row items-center">
            <TrendingUp size={14} color={isMatch ? '#059669' : isExcess ? '#2563EB' : '#DC2626'} />
            <Text className={`ml-1 text-sm font-bold ${isMatch ? 'text-emerald-700' : isExcess ? 'text-blue-700' : 'text-red-700'}`}>
              {isMatch ? 'Khớp ✔' : isExcess ? 'Thừa tiền' : 'Thiếu tiền'}
            </Text>
          </View>

          {!isMatch && (
            <Text
              className={`text-sm font-bold ${
                isExcess ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              {isExcess ? '+' : '-'} {Math.abs(difference).toLocaleString()} VND
            </Text>
          )}
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
