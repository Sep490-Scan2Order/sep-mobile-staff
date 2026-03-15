/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { toggleSoldOutThunk } from '../store/slices/dishSlice';

interface Props {
  id: number;
  name: string;
  price: string;
  image: string;
  active: boolean;
  originalPrice?: number;
  discountedPrice?: number;
  promotionName?: string | null;
  hasPromotion?: boolean;
}

export const FoodItemCard: React.FC<Props> = ({
  id,
  name,
  price,
  image,
  active,
  originalPrice,
  discountedPrice,
  promotionName,
  hasPromotion,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // lấy restaurantId từ redux auth
  const restaurantId = useSelector(
    (state: RootState) => state.auth.userInfo?.restaurantId,
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('');

  const openModal = () => {
    setModalVisible(true);
  };

  const handleSubmit = () => {
    const qty = Number(quantity);

    dispatch(
      toggleSoldOutThunk({
        restaurantId,
        id,
        isSoldOut: false,
        quantity: qty,
      }),
    );

    setModalVisible(false);
    setQuantity('');
  };

  const handleSoldOut = () => {
    dispatch(
      toggleSoldOutThunk({
        restaurantId,
        id,
        isSoldOut: true,
        quantity: 0,
      }),
    );
  };

  return (
    <>
      <View
        className="mx-6 mt-4 rounded-xl overflow-hidden border"
        style={{
          backgroundColor: 'rgba(34, 107, 93, 0.3)',
          borderColor: 'rgba(34, 107, 93, 0.44)',
        }}
      >
        <View className="flex-row items-center p-3">
          <Image source={{ uri: image }} className="w-14 h-14 rounded-lg" />

          <View className="flex-1 ml-3">
            <Text className="font-medium text-gray-800">{name}</Text>

            {hasPromotion && originalPrice && discountedPrice ? (
              <View>
                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-500 line-through mr-2">
                    {originalPrice.toLocaleString()} đ
                  </Text>
                  <Text className="text-sm font-semibold text-red-600">
                    {discountedPrice.toLocaleString()} đ
                  </Text>
                </View>

                {promotionName && (
                  <Text className="text-xs text-orange-600 mt-1">
                    {promotionName}
                  </Text>
                )}
              </View>
            ) : (
              <Text className="text-sm text-gray-700">{price}</Text>
            )}
          </View>

          {active ? (
            <TouchableOpacity
              onPress={handleSoldOut}
              className="bg-green-600 px-3 py-1 rounded-lg"
            >
              <Text className="text-white text-xs">Đang bán</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={openModal}
              className="bg-red-600 px-3 py-1 rounded-lg"
            >
              <Text className="text-white text-xs">Hết hàng</Text>
            </TouchableOpacity>
          )}
        </View>

        {!active && (
          <View
            className="px-3 py-2 border-t"
            style={{
              borderTopColor: 'rgba(34, 107, 93, 0.44)',
            }}
          >
            <Text className="text-xs text-red-700">
              Món ăn tạm hết - Nhấn "Hết hàng" để nhập lại số lượng
            </Text>
          </View>
        )}
      </View>

      {/* Modal nhập số lượng */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <View className="bg-white p-5 rounded-xl w-72">
            <Text className="text-lg font-semibold mb-3">
              Nhập số lượng món
            </Text>

            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Nhập số lượng"
              className="border p-2 rounded mb-4"
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mr-4"
              >
                <Text className="text-gray-600">Huỷ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-green-600 px-3 py-1 rounded"
              >
                <Text className="text-white">Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
