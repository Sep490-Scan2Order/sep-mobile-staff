import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '@/store';
import { checkInShift, setShift } from '@/store/slices/shiftSlice';
import { AppSnackbar } from '@/components/AppSnackbar';
import { useSnackbar } from '@/hooks/useSnackbar';

export const GlobalCheckInModal = () => {
  const dispatch = useDispatch<any>();
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const currentShift = useSelector((state: RootState) => state.shift.currentShift);
  const loading = useSelector((state: RootState) => state.shift.loading);

  const [cash, setCash] = useState('');
  const [note, setNote] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const snackbar = useSnackbar();

  // Modal is visible if authenticated and no active shift
  const isVisible = !!user && !currentShift;

  const handleCheckIn = async () => {
    if (!cash) {
      snackbar.showWarning('Vui lòng nhập số tiền đầu ca');
      return;
    }
    if (!user) {
      snackbar.showError('Thông tin người dùng không khả dụng');
      return;
    }

    try {
      setIsCheckingIn(true);
      const result = await dispatch(
        checkInShift({
          restaurantId: user.restaurantId!,
          staffId: user.id!,
          openingCashAmount: Number(cash),
          note: note,
        }),
      ).unwrap();

      dispatch(setShift(result));
      setCash('');
      setNote('');
      // No need to show success as the modal will disappear immediately
    } catch (error: any) {
      snackbar.showError(error?.message || 'Check-in thất bại');
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {}} // Ngăn chặn đóng bằng nút back trên Android
    >
      <View className="flex-1 bg-teal-700">
        <StatusBar barStyle="light-content" backgroundColor="#134e4a" />

        <SafeAreaView className="flex-1" edges={['top']}>
          {/* Mock Header for the modal */}
          <View className="flex-row items-center justify-center p-4 bg-teal-800">
            <Text className="text-xl font-bold text-white">YÊU CẦU CHECK-IN</Text>
          </View>

          <View className="flex-1 bg-white p-6">
            <Text className="text-xl font-bold text-teal-700 text-center mb-6">
              Bạn Cần Bắt Đầu Ca Làm Việc!
            </Text>

            <View className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm flex-1 justify-center">
              <Text className="text-lg font-bold text-gray-800 text-center">
                Xin chào, {user?.name}
              </Text>
              <Text className="mb-8 text-gray-500 text-sm italic text-center">
                Vai trò: {user?.role}
              </Text>

              <Text className="mt-3 mb-2 font-bold text-gray-700">Số tiền đầu ca (VNĐ) <Text className="text-red-500">*</Text></Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 text-base bg-white"
                placeholder="Nhập số tiền..."
                value={cash}
                onChangeText={setCash}
                keyboardType="numeric"
              />

              <Text className="mt-4 mb-2 font-bold text-gray-700">Ghi chú (Tùy chọn)</Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 text-base bg-white"
                placeholder="Nhập ghi chú..."
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
              />

              {/* CHECK IN BUTTON */}
              <TouchableOpacity
                className="bg-teal-700 p-4 rounded-xl mt-8 items-center"
                onPress={handleCheckIn}
                disabled={isCheckingIn || loading}
              >
                {isCheckingIn || loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-lg">Bắt Đầu Ca</Text>
                )}
              </TouchableOpacity>
              
              <Text className="text-center text-gray-400 mt-4 text-xs italic">
                *Bạn phải cung cấp số tiền thu ngân ban đầu để sử dụng hệ thống
              </Text>
            </View>
          </View>
        </SafeAreaView>

        <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
      </View>
    </Modal>
  );
};
