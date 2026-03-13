import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { HeaderDetail } from '../components/HeaderDetail';
import { CustomerDetailBorder } from '../components/CustomerDetailBorder';
import { Border } from '../components/Border';

interface DetailPaymentProps {
  order: Order;
  paymentMethod: 'cash' | 'transfer';
  onConfirm: () => void;
}

export const DetailPaymentComponent: React.FC<DetailPaymentProps> = ({
  order,
  paymentMethod,
  onConfirm,
}) => {
  const voucher = 125000; // giả sử demo
  const total = order.amount - voucher;

  return (
    <View className="flex-1">
      <HeaderDetail />
      <ScrollView className="px-7 -mt-90" style={{ marginTop: -175 }}>
        <CustomerDetailBorder order={order} />

        <Border>
          <View className="flex-row justify-between mb-3">
            <Text className="text-lg font-medium">Phương thức:</Text>
            <Text className="text-lg font-medium">
              {paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
            </Text>
          </View>
        </Border>

        <Border>
          <View className="mt-4">
            <Text className="font-semibold text-2xl mb-4">
              Chi tiết thanh toán
            </Text>

            <View className="flex-row justify-between mb-3">
              <Text className="text-lg font-medium">Tạm tính:</Text>
              <Text className="text-lg font-medium">
                {order.amount.toLocaleString()} VND
              </Text>
            </View>

            <View className="flex-row justify-between mb-3">
              <Text className="text-lg font-medium text-red-500">Voucher:</Text>
              <Text className="text-lg font-medium text-red-500">
                - {voucher.toLocaleString()} VND
              </Text>
            </View>

            <View className="border-t border-gray-300 my-3" />

            <View className="flex-row justify-between">
              <Text className="text-xl font-bold">Tổng tiền:</Text>
              <Text className="text-xl font-bold text-[#226B5D]">
                {total.toLocaleString()} VND
              </Text>
            </View>
          </View>
        </Border>
      </ScrollView>

      <View className="px-4 pb-6 bg-gray-100">
        <TouchableOpacity
          onPress={onConfirm}
          className="bg-[#226B5D] py-4 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-white text-lg font-semibold">
            {paymentMethod === 'cash'
              ? 'Nhập tiền khách đưa'
              : 'Tạo mã chuyển khoản'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
