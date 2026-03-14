import React from 'react';
import { View, Text, Image } from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  originalPrice?: number;
  discountAmount?: number;
  promotionName?: string;
  subTotal?: number;
}

interface ListFoodProps {
  item: OrderItem;
}

export const ListFood: React.FC<ListFoodProps> = ({ item }) => {
  return (
    <View className="flex-row bg-white rounded-2xl p-4 mb-3 border border-gray-100">
      {/* Image */}
      <Image
        source={{
          uri: item.image,
        }}
        className="w-14 h-14 rounded-xl"
      />

      {/* Content */}
      <View className="flex-1 ml-3 justify-between">
        {/* Name */}
        <Text className="text-gray-900 font-medium text-base">{item.name}</Text>

        {/* Promotion name */}
        {item.promotionName && (
          <Text className="text-gray-500 text-xs mt-1">
            {item.promotionName}
          </Text>
        )}

        {/* Price */}
        <View className="flex-row items-center mt-1">
          <Text className="text-[#226B5D] font-semibold text-sm">
            {item.price} đ
          </Text>

          {item.originalPrice && item.originalPrice > item.price && (
            <Text className="text-gray-400 line-through ml-2 text-xs">
              {item.originalPrice.toLocaleString()} đ
            </Text>
          )}
        </View>

        {/* Discount */}
        {item.discountAmount && item.discountAmount > 0 && (
          <Text className="text-red-500 text-xs mt-1">
            -{item.discountAmount.toLocaleString()} đ khuyến mãi
          </Text>
        )}
      </View>

      {/* Right side */}
      <View className="items-end justify-between ml-2">
        {/* Quantity */}
        <View className="px-2 py-1 ">
          <Text className="text-gray-700 text-xs">x{item.quantity}</Text>
        </View>

        {/* Subtotal */}
        {item.subTotal && (
          <Text className="text-[#226B5D] font-semibold text-sm mt-2">
            {item.subTotal.toLocaleString()} đ
          </Text>
        )}
      </View>
    </View>
  );
};
