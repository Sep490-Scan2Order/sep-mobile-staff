import React from 'react';
import { View, Text, Image } from 'react-native';
import { MapPin, Clock } from 'lucide-react-native';

interface Props {
  name: string;
  address: string;
  openTime: string;
  image: string;
}

export const RestaurantCard: React.FC<Props> = ({
  name,
  address,
  openTime,
  image,
}) => {
  return (
    <View className="  bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-800">{name}</Text>

        <View className="flex-row items-center mt-1">
          <MapPin size={14} color="#226B5D" />
          <Text className="ml-1 text-xs text-gray-500">{address}</Text>
        </View>
      </View>

      <Image
        source={{ uri: image }}
        className="w-full h-44"
        resizeMode="cover"
      />

      <View className="p-4 border-t border-gray-200">
        <View className="flex-row items-center">
          <Clock size={14} color="#226B5D" />
          <View className="ml-1">
            <Text className="text-xs text-gray-500">Mở bán</Text>
            <Text className="text-sm font-medium">{openTime}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
