import React from 'react';
import { View, Text, Image } from 'react-native';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({}) => {
  return (
    <View className="bg-teal-700 px-4 py-1 items-center justify-center">
      <Image
        source={{
          uri: 'https://res.cloudinary.com/dw08iedyd/image/upload/v1770542915/image-removebg-preview_1_hmto3f.png',
        }}
        className="w-40 h-40"
        resizeMode="contain"
      />
    </View>
  );
};
