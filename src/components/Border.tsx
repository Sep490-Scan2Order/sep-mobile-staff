import React from 'react';
import { View } from 'react-native';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const Border: React.FC<Props> = ({ children, className }) => {
  return (
    <View className={`bg-white rounded-2xl p-4 shadow-md mb-4 ${className}`}>
      {children}
    </View>
  );
};
