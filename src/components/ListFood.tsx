import React from 'react';
import { View, Text, Image } from 'react-native';

const foods = [1, 2, 3, 4];

export const ListFood = () => {
  return (
    <View>
      {foods.map((item, index) => (
        <View
          key={index}
          className="flex-row items-center bg-[#E6EFEA] rounded-xl p-3 mb-3 shadow-sm"
        >
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
            }}
            className="w-14 h-14 rounded-lg"
          />

          <View className="flex-1 ml-3">
            <Text className="text-gray-800 font-medium">Combo 1 người</Text>
            <Text className="text-gray-500 text-sm">100.000 VND</Text>
          </View>

          <Text className="text-gray-600">1 phần</Text>
        </View>
      ))}

      <View className="flex-row justify-between mt-4">
        <Text className="text-red-500 font-semibold text-2xl">Tổng Tiền:</Text>
        <Text className="text-red-500 font-semibold text-2xl">400.000 VND</Text>
      </View>
    </View>
  );
};
