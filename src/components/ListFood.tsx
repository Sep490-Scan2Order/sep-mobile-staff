import React from 'react';
import { View, Text, Image } from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ListFoodProps {
  item: OrderItem;
}

export const ListFood: React.FC<ListFoodProps> = ({ item }) => {
  return (
    <View className="flex-row items-center bg-[#E6EFEA] rounded-xl p-3 mb-3 shadow-sm">
      <Image source={{ uri: item.image }} className="w-14 h-14 rounded-lg" />

      <View className="flex-1 ml-3">
        <Text className="text-gray-800 font-medium">{item.name}</Text>
        <Text className="text-gray-500 text-sm">
          {item.price.toLocaleString()} VND
        </Text>
      </View>

      <Text className="text-gray-600">{item.quantity} phần</Text>
    </View>
  );
};
