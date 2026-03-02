import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CheckCircle, ArrowLeft } from 'lucide-react-native';
import { CustomerDetailBorder } from './CustomerDetailBorder';
import { Border } from './Border';
import { HeaderDetail } from './HeaderDetail';

interface PaymentSuccessProps {
  order: Order;
  cashReceived: number; // tiền khách đưa
  onComplete: () => void;
}
export const CashPaymentSuccessComponent: React.FC<PaymentSuccessProps> = ({
  order,
  cashReceived = 0,
  onComplete,
}) => {
  const subtotal = Number(order?.amount) || 0;
  const discount = Number(order?.discount) || 0;
  const total = subtotal - discount;
  const change = Number(cashReceived) - total;

  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail
        isSuccess={true}
        title="Thanh toán thành công"
        onBack={onComplete}
      />

      <ScrollView className="px-7 -mt-60">
        <CustomerDetailBorder order={order} />

        <View className="mb-10">
          <Border>
            <View className="py-2">
              <View className="items-center mb-6">
                <Text className="text-lg font-bold text-gray-800">
                  HÓA ĐƠN THANH TOÁN
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Mã đơn: {order.id} | {order.tableName}
                </Text>
              </View>

              {/* Danh sách món */}
              {order.items.map((item, index) => (
                <View key={item.id} className="flex-row justify-between mb-3">
                  <Text className="text-gray-600 text-sm">
                    {index + 1}. {item.name} x{item.quantity}
                  </Text>
                  <Text className="font-medium text-sm">
                    {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                  </Text>
                </View>
              ))}

              <View className="border-t border-dashed border-gray-300 my-4" />

              {/* Tính toán tiền */}
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-sm">Tạm tính:</Text>
                  <Text className="font-medium text-sm">
                    {subtotal.toLocaleString('vi-VN')} VND
                  </Text>
                </View>

                {discount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">Giảm giá:</Text>
                    <Text className="text-red-500 text-sm">
                      -{discount.toLocaleString('vi-VN')} VND
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between mt-2">
                  <Text className="font-bold text-[#226B5D] text-base">
                    Tổng cộng:
                  </Text>
                  <Text className="font-bold text-[#226B5D] text-xl">
                    {total.toLocaleString('vi-VN')} VND
                  </Text>
                </View>
              </View>

              <View className="border-t border-gray-100 my-4" />

              {/* Tiền mặt */}
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-500 text-sm">Tiền khách đưa:</Text>
                <Text className="font-bold text-sm text-gray-800">
                  {cashReceived.toLocaleString('vi-VN')} VND
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Tiền thối lại:</Text>
                <Text className="font-bold text-[#226B5D] text-base">
                  {change.toLocaleString('vi-VN')} VND
                </Text>
              </View>
            </View>
          </Border>
        </View>
      </ScrollView>

      <View className="bg-white px-6 pb-10 pt-4 shadow-2xl">
        <TouchableOpacity
          onPress={onComplete}
          activeOpacity={0.8}
          className="bg-[#226B5D] py-4 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-white text-lg font-bold">Hoàn tất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
