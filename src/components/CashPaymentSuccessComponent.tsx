import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CheckCircle, ArrowLeft } from 'lucide-react-native';
import { CustomerDetailBorder } from './CustomerDetailBorder';
import { Border } from './Border';
import { HeaderDetail } from './HeaderDetail';

interface PaymentSuccessProps {
  onComplete: () => void;
}

export const CashPaymentSuccessComponent: React.FC<PaymentSuccessProps> = ({
  onComplete,
}) => {
  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail
        isSuccess={true}
        title="Thanh toán thành công"
        onBack={onComplete}
      />

      {/* 2. ScrollView bao quát nội dung ở giữa */}
      <ScrollView className="px-7 -mt-60">
        {/* Component hiển thị thông tin khách hàng */}
        <CustomerDetailBorder />

        {/* Khung hóa đơn trắng sử dụng Border component */}
        <View className="mb-10">
          <Border>
            <View className="py-2">
              <View className="items-center mb-6">
                <Text className="text-lg font-bold text-gray-800">
                  HÓA ĐƠN THANH TOÁN
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Mã đơn: ORD-2026-001 | Bàn 5
                </Text>
              </View>

              {/* Danh sách món ăn */}
              {[1, 2, 3, 4].map(item => (
                <View key={item} className="flex-row justify-between mb-3">
                  <Text className="text-gray-600 text-sm">
                    {item}. Combo 1 người x1
                  </Text>
                  <Text className="font-medium text-sm">100.000 VND</Text>
                </View>
              ))}

              <View className="border-t border-dashed border-gray-300 my-4" />

              {/* Chi tiết tính toán tiền */}
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-sm">Tạm tính:</Text>
                  <Text className="font-medium text-sm">400.000 VND</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-sm">Giảm giá (10%):</Text>
                  <Text className="text-red-500 text-sm">-40.000 VND</Text>
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text className="font-bold text-[#226B5D] text-base">
                    Tổng cộng:
                  </Text>
                  <Text className="font-bold text-[#226B5D] text-xl">
                    360.000 VND
                  </Text>
                </View>
              </View>

              <View className="border-t border-gray-100 my-4" />

              {/* Thông tin tiền mặt */}
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-500 text-sm">Tiền khách đưa:</Text>
                <Text className="font-bold text-sm text-gray-800">
                  500.000 VND
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-500 text-sm">Tiền thối lại:</Text>
                <Text className="font-bold text-[#226B5D] text-base">
                  140.000 VND
                </Text>
              </View>
            </View>
          </Border>
        </View>
      </ScrollView>

      {/* 3. Nút Hoàn tất cố định phía dưới */}
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
