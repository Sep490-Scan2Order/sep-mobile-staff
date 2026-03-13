import React from 'react';
import { View, Text, Image } from 'react-native';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({}) => {
  return (
    <View className="bg-teal-700 px-4 py-1 items-center justify-center">
      <Image className="w-60 " style={{ height: 40 }} resizeMode="contain" />
    </View>
  );
};
