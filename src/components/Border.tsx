import React from 'react';
import { View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export const Border: React.FC<Props> = ({ children }) => {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-md mb-4">{children}</View>
  );
};
