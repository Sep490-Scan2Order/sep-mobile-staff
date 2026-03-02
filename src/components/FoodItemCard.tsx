/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, Image, Switch } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { toggleSoldOutThunk } from '../store/slices/dishSlice';

interface Props {
  id: number;
  name: string;
  price: string;
  image: string;
  active: boolean; // true = đang bán
}

export const FoodItemCard: React.FC<Props> = ({
  id,
  name,
  price,
  image,
  active,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleToggle = () => {
    dispatch(
      toggleSoldOutThunk({
        id,
        isSoldOut: active,
      }),
    );
  };

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
            uri: image,
          }}
          className="w-14 h-14 rounded-lg"
        />

        <View className="flex-1 ml-3">
          <Text className="font-medium text-gray-800">{name}</Text>
          <Text className="text-sm text-gray-700">{price}</Text>
        </View>

        <Switch value={active} onValueChange={handleToggle} />
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
