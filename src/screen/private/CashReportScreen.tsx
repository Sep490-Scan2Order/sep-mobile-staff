import React, { useMemo, useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { HeaderDetail } from '../../components/HeaderDetail';
import { StaffDetailBorder } from '../../components/StaffDetailBorder';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
export const CashReportScreen = () => {
  // 🔥 Mock data
  const [totalOrder, setTotalOrder] = useState('1000000');
  const [actualCash, setActualCash] = useState('1200000');
  const [note, setNote] = useState('');

  const total = Number(totalOrder);
  const actual = Number(actualCash);

  const result = useMemo(() => {
    if (!total || !actual) return null;

    if (actual > total) {
      return {
        type: 'excess',
        amount: actual - total,
      };
    }

    if (actual < total) {
      return {
        type: 'shortage',
        amount: total - actual,
      };
    }

    return { type: 'match', amount: 0 };
  }, [total, actual]);

  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail />
      <StaffDetailBorder />

      <ScrollView className="flex-1 mt-6">
        <View className="bg-white mx-6 rounded-2xl p-5 shadow-sm">
          <InputField
            label="Tổng tiền đơn hàng"
            value={totalOrder}
            onChangeText={setTotalOrder}
          />

          <InputField
            label="Số tiền thực tế trong ngân kéo"
            value={actualCash}
            onChangeText={setActualCash}
          />

          <InputField
            label="Ghi chú"
            multiline
            value={note}
            onChangeText={setNote}
          />

          {/* 🔥 Hiển thị kết quả */}
          {result && (
            <View className="mt-4">
              {result.type === 'excess' && (
                <Text className="text-green-600 font-semibold">
                  Thừa tiền: {result.amount.toLocaleString()} VND
                </Text>
              )}

              {result.type === 'shortage' && (
                <Text className="text-red-600 font-semibold">
                  Thiếu tiền: {result.amount.toLocaleString()} VND
                </Text>
              )}

              {result.type === 'match' && (
                <Text className="text-emerald-600 font-semibold">
                  Số tiền khớp ✔
                </Text>
              )}
            </View>
          )}
        </View>

        <View className="mt-6 mb-24">
          <PrimaryButton title="Gửi báo cáo" />
        </View>
      </ScrollView>
    </View>
  );
};
