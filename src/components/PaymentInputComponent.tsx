import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { HeaderDetail } from './HeaderDetail';
import { Border } from './Border';

// 1. Cập nhật interface cho đúng tên prop bạn đang dùng ở Screen
interface PaymentInputProps {
  onBack: () => void;
  onConfirmPayment: () => void; // Đã đổi tên ở đây
  totalAmount?: string;
}

export const PaymentInputComponent: React.FC<PaymentInputProps> = ({
  onBack,
  onConfirmPayment, // Nhận prop đã đổi tên
  totalAmount = '275.000',
}) => {
  const quickAmounts = ['100.000', '100.000', '100.000', '100.000'];

  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail onBack={onBack} title="Chi tiết thanh toán" />

      <ScrollView className="px-7 -mt-80" showsVerticalScrollIndicator={false}>
        <View className="px-6 mb-10">
          <View className="bg-white/20 border border-white/30 rounded-2xl p-8 items-center">
            <Text className="text-white text-sm mb-4">
              Tổng số tiền cần phải thanh toán
            </Text>
            <Text className="text-white text-4xl font-bold">
              {totalAmount} VND
            </Text>
          </View>
        </View>

        <Border>
          <View className="py-2">
            <Text className="text-[#226B5D] font-bold text-lg mb-4">
              Số tiền khách đưa
            </Text>
            <TextInput
              keyboardType="numeric"
              className="border border-gray-300 rounded-xl p-4 text-xl mb-6 bg-white"
              placeholder="Nhập số tiền..."
            />
            <View className="flex-row flex-wrap justify-between">
              {quickAmounts.map((amt, index) => (
                <TouchableOpacity
                  key={index}
                  className="w-[48%] border border-gray-300 rounded-xl py-4 items-center mb-4 bg-white shadow-sm"
                >
                  <Text className="font-semibold text-gray-700 text-lg">
                    {amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Border>
      </ScrollView>

      <View className="px-4 pb-10 bg-white pt-4">
        <TouchableOpacity
          onPress={onConfirmPayment} // Gọi đúng hàm đã đổi tên
          className="bg-[#226B5D] py-4 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-white text-lg font-semibold">Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
