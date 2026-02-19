import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  number: number;
  label: string;
}

export const StatCard: React.FC<Props> = ({ number, label }) => {
  return (
    <View className="border-white/30 border flex-1 bg-white/20 rounded-xl py-4 items-center mx-1">
      <Text className="text-white text-xl font-bold">{number}</Text>
      <Text className="text-white text-xs mt-1">{label}</Text>
    </View>
  );
};
