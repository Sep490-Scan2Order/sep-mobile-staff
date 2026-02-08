import React from 'react';
import { View, Image, Text } from 'react-native';

export default function WelcomePage() {
  return (
    <View className="flex-1 justify-center items-center bg-[#226B5D]">
      <Image
        source={{
          uri: 'https://res.cloudinary.com/dw08iedyd/image/upload/v1770542915/image-removebg-preview_1_hmto3f.png',
        }}
        className="w-64 h-64"
        resizeMode="contain"
      />

    </View>
  );
}