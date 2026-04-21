import React, { useState } from 'react';
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
import { checkInShift, setShift, fetchCurrentShift } from '@/store/slices/shiftSlice';
import { logout } from '@/store/slices/authSlice';
import { AppSnackbar } from '@/components/AppSnackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { LogOut } from 'lucide-react-native';
export const GlobalCheckInModal = () => {
  const dispatch = useDispatch<any>();
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const currentShift = useSelector((state: RootState) => state.shift?.currentShift);
  const loading = useSelector((state: RootState) => state.shift?.loading);
  const hasFetchedStatus = useSelector((state: RootState) => state.shift?.hasFetchedStatus);
  const [cash, setCash] = useState('');
  const [note, setNote] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const snackbar = useSnackbar();
  React.useEffect(() => {
    if (!!user && !hasFetchedStatus) {
      dispatch(fetchCurrentShift());
    }
  }, [user, hasFetchedStatus, dispatch]);
  const isLocked = !!user && !currentShift && (user.role === 'Cashier' || user.role === 'Staff');
  if (!isLocked) return null;
  if (!hasFetchedStatus || loading) {
    return (
      <Modal visible={true} transparent={false}>
        <View className="flex-1 bg-teal-800 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4 font-bold">Đang kiểm tra ca làm việc...</Text>
        </View>
      </Modal>
    );
  }
  const handleCheckIn = async () => {
    if (!cash && user?.role === 'Cashier') {
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
    } catch (error: any) {
      snackbar.showError(error?.message || 'Check-in thất bại');
    } finally {
      setIsCheckingIn(false);
    }
  };
  const handleLogout = () => {
    dispatch(logout());
  };
  return (
    <Modal
      visible={isLocked}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {}} 
    >
      <View className="flex-1 bg-teal-700">
        <StatusBar barStyle="light-content" backgroundColor="#134e4a" />
        <SafeAreaView className="flex-1" edges={['top']}>
          {}
          <View className="flex-row items-center justify-between p-4 bg-teal-800">
            <View style={{ width: 40 }} />
            <Text className="text-xl font-bold text-white uppercase">Yêu cầu Check-in</Text>
            <TouchableOpacity 
              onPress={handleLogout} 
              className="p-1 items-center justify-center"
              activeOpacity={0.7}
            >
              <LogOut size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex-1 bg-white p-6 justify-center">
            <View className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
              <Text className="text-2xl font-bold text-teal-800 text-center mb-2">
                Bắt đầu ca làm việc
              </Text>
              <Text className="text-gray-500 text-center mb-8">
                Bạn cần check-in để truy cập các tính năng bên trong
              </Text>
              <View className="bg-white rounded-2xl p-6 border border-teal-100 mb-8 items-center">
                <Text className="text-lg font-bold text-gray-800">
                    {user?.name}
                </Text>
                <View className="bg-teal-50 px-3 py-1 rounded-full mt-2">
                    <Text className="text-teal-700 text-xs font-bold uppercase">
                        Vai trò: {user?.role === 'Cashier' ? 'Thu ngân' : 'Nhân viên'}
                    </Text>
                </View>
              </View>
              {user?.role === 'Cashier' && (
                <View className="mb-6">
                  <Text className="mb-2 font-bold text-gray-700">Số tiền đầu ca (VNĐ) <Text className="text-red-500">*</Text></Text>
                  <TextInput
                    className="border border-gray-200 rounded-xl p-4 text-lg bg-white text-gray-900"
                    placeholder="Nhập số tiền..."
                    value={cash}
                    onChangeText={setCash}
                    keyboardType="numeric"
                  />
                </View>
              )}
              <View className="mb-8">
                <Text className="mb-2 font-bold text-gray-700">Ghi chú (Tùy chọn)</Text>
                <TextInput
                    className="border border-gray-200 rounded-xl p-4 text-base bg-white text-gray-900"
                    placeholder="Nhập ghi chú..."
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                />
              </View>
              <TouchableOpacity
                className="bg-teal-700 py-5 rounded-2xl items-center shadow-lg"
                onPress={handleCheckIn}
                disabled={isCheckingIn || loading}
              >
                {isCheckingIn || loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-xl">Vào ca ngay</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
      </View>
    </Modal>
  );
};
