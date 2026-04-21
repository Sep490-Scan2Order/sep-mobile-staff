import React, { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AppDispatch, RootState } from '@/store';
import { toggleSoldOutThunk } from '@/store/slices/dishSlice';
import { RootStackParamList } from '@/type';

interface ComboItemProp {
  dishId: number;
  dishName: string;
  imageUrl?: string;
  quantity: number;
}

interface Props {
  index?: number;
  id: number;
  name: string;
  price: string;
  image: string;
  active: boolean;
  originalPrice?: number;
  discountedPrice?: number;
  promotionName?: string | null;
  hasPromotion?: boolean;
  quantity?: number;
  isCombo?: boolean;
  comboItems?: ComboItemProp[];
  description?: string | null;
}

export const FoodItemCard: React.FC<Props> = React.memo(({
  index = 0,
  id,
  name,
  price,
  image,
  active,
  originalPrice,
  discountedPrice,
  promotionName,
  hasPromotion,
  quantity: stockQuantity,
  isCombo,
  comboItems,
  description,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const restaurantId = useSelector(
    (state: RootState) => state.auth.userInfo?.restaurantId,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('');

  const openDetail = () => {
    navigation.navigate('FoodDetailScreen', {
      id,
      name,
      price,
      image,
      active,
      originalPrice,
      discountedPrice,
      promotionName,
      hasPromotion,
      stockQuantity,
      isCombo,
      comboItems,
      description,
    });
  };

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
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn chuyển món "${name}" sang báo hết hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: () => {
            dispatch(
              toggleSoldOutThunk({
                restaurantId,
                id,
                isSoldOut: true,
                quantity: stockQuantity || 0,
              }),
            );
          },
        },
      ],
    );
  };

  const handleTurnOn = () => {
    dispatch(
      toggleSoldOutThunk({
        restaurantId,
        id,
        isSoldOut: false,
        quantity: stockQuantity || 0,
      }),
    );
  };

  return (
    <>
      {}
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(400)}
        className="mx-6 mt-4 rounded-xl overflow-hidden border"
        style={{
          backgroundColor: 'rgba(34, 107, 93, 0.3)',
          borderColor: 'rgba(34, 107, 93, 0.44)',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={openDetail}
        >
          <View className="flex-row items-center p-3">
            <Image source={{ uri: image }} className="w-14 h-14 rounded-lg" />
            <View className="flex-1 ml-3 relative">
              <View className="flex-row items-center flex-wrap mr-10">
                <Text className="font-medium text-gray-800 flex-wrap mr-1">{name}</Text>
                {isCombo && (
                  <View style={{ backgroundColor: '#dbeafe', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 }}>
                    <Text style={{ fontSize: 10, color: '#1d4ed8', fontWeight: '700' }}>COMBO</Text>
                  </View>
                )}
              </View>
              {hasPromotion && originalPrice && discountedPrice ? (
                <View className="mt-0.5">
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500 line-through mr-2">
                      {originalPrice.toLocaleString()} đ
                    </Text>
                    <Text className="text-sm font-semibold text-red-600">
                      {discountedPrice.toLocaleString()} đ
                    </Text>
                  </View>
                  {promotionName && (
                    <Text className="text-[10px] text-orange-600 mt-0.5">
                      {promotionName}
                    </Text>
                  )}
                </View>
              ) : (
                <Text className="text-sm text-gray-700 mt-0.5">{price}</Text>
              )}
              <View className="flex-row flex-wrap items-center mt-1">
                <Text className={`text-[11px] font-semibold mr-2 ${active ? 'text-green-700' : 'text-red-600'}`}>
                  {active ? '● Đang bán' : '● Hết hàng'}
                </Text>
                <Text className="text-[11px] text-emerald-700 font-medium mr-2">
                  Kho: {stockQuantity ?? 0}
                </Text>
              </View>
            </View>
            <View className="items-end justify-center ml-1">
              <Switch
                trackColor={{ false: '#fca5a5', true: '#6ee7b7' }}
                thumbColor={active ? '#059669' : '#dc2626'}
                ios_backgroundColor="#fca5a5"
                onValueChange={(val) => {
                  if (!val) {
                    handleSoldOut();
                  } else {
                    handleTurnOn();
                  }
                }}
                value={active}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
              <TouchableOpacity
                onPress={openModal}
                className="bg-teal-600 px-2 py-1 rounded-md mt-2"
                activeOpacity={0.7}
              >
                <Text className="text-white text-[10px] font-medium">Nhập SL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {!active && (
          <View
            className="px-3 py-1.5 border-t bg-rose-50"
            style={{ borderTopColor: 'rgba(34, 107, 93, 0.2)' }}
          >
            <Text className="text-[11px] text-red-600 italic">
              Món ăn tạm ngưng phục vụ - Bạn có thể bật lại công tắc để bán tiếp.
            </Text>
          </View>
        )}
      </Animated.View>

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
});
