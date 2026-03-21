import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  number: number;
  label: string;
}

/**
 * Thẻ hiển thị số liệu thống kê.
 * Thiết kế cho nền sáng (Trắng), mang lại cảm giác chuyên nghiệp và dễ đọc.
 */
export const StatCard: React.FC<Props> = ({ number, label }) => {
  return (
    <View className="flex-1 bg-teal-50/50 rounded-2xl py-4 items-center mx-1 border border-teal-700 shadow-sm ">
      <Text className="text-teal-700 text-2xl font-black">{number}</Text>
      <Text className="text-teal-600/70 text-[10px] font-bold uppercase tracking-wider mt-1">
        {label}
      </Text>
    </View>
  );
};
