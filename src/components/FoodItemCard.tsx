/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, Image, Switch } from 'react-native';

interface Props {
  name: string;
  price: string;
  active: boolean;
}

export const FoodItemCard: React.FC<Props> = ({ name, price, active }) => {
  return (
    <View
      className="mx-6 mt-4 rounded-xl overflow-hidden border"
      style={{
        backgroundColor: 'rgba(34, 107, 93, 0.3)',
        borderColor: 'rgba(34, 107, 93, 0.44)',
      }}
    >
      <View className="flex-row items-center p-3">
        <Image
          source={{
            uri: 'https://i.imgur.com/0y0y0y0.jpg',
          }}
          className="w-14 h-14 rounded-lg"
        />

        <View className="flex-1 ml-3">
          <Text className="font-medium text-gray-800">{name}</Text>
          <Text className="text-sm text-gray-700">{price}</Text>
        </View>

        <Switch value={active} />
      </View>

      {!active && (
        <View
          className="px-3 py-1 border-t"
          style={{
            borderTopColor: 'rgba(34, 107, 93, 0.44)',
          }}
        >
          <Text className="text-xs">Món ăn tạm dừng bán</Text>
        </View>
      )}
    </View>
  );
};
