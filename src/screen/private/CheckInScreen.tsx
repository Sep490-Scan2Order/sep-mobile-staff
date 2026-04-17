import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '@/store';
import { shiftService } from '@/services/logicServices/shiftService';
import {
  checkInShift,
  clearShift,
  setShift,
  fetchCurrentShift,
} from '@/store/slices/shiftSlice';
import { Header } from '@/components/Header';
import { AppSnackbar } from '@/components/AppSnackbar';
import { AppModal } from '@/components/AppModal';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useAppModal } from '@/hooks/useAppModal';
export default function CheckInScreen() {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const currentShift = useSelector(
    (state: RootState) => state.shift.currentShift,
  );
  const [cash, setCash] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const snackbar = useSnackbar();
  const modal = useAppModal();
  const formatCurrency = (value: any) => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toLocaleString('vi-VN');
  };
  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchCurrentShift());
  }, [user?.id, dispatch]);
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
      setLoading(true);
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
      snackbar.showSuccess('Check-in thành công! Ca làm đã bắt đầu.');
    } catch (error: any) {
      snackbar.showError(error?.message || 'Check-in thất bại');
    } finally {
      setLoading(false);
    }
  };
  const handleCheckOut = async () => {
    if (!cash) {
      snackbar.showWarning('Vui lòng nhập tiền cuối ca');
      return;
    }
    if (!currentShift?.id) {
      snackbar.showError('Không tìm thấy ca làm hiện tại');
      return;
    }
    try {
      setLoading(true);
      const report = await shiftService.getPreview(currentShift.id);
      setLoading(false);
      const expected = report.expectedCashAmount || 0;
      const actual = Number(cash);
      const difference = actual - expected;
      const diffPrefix = difference > 0 ? '+' : '';
      const msg = `Chi tiết ca làm:\n- Doanh thu Tiền mặt: ${formatCurrency(report.totalCashOrder)} đ\n- Doanh thu Chuyển khoản: ${formatCurrency(report.totalTransferOrder)} đ\n- Tổng Hoàn tiền: ${formatCurrency(report.totalRefundAmount)} đ\n\nTiền mặt dự kiến phải có: ${formatCurrency(expected)} đ\nTiền thực tế bạn nhập: ${formatCurrency(actual)} đ\n\n>>> CHÊNH LỆCH: ${diffPrefix}${formatCurrency(difference)} đ <<<\n\nBạn có chắc chắn nộp tiền và kết thúc ca?`;
      modal.showConfirm(
        'BÁO CÁO KẾT CA',
        msg,
        async () => {
          try {
            setLoading(true);
            await shiftService.checkOut({
              shiftId: currentShift.id,
              cashAmount: actual,
              note: note,
            });
            dispatch(clearShift());
            setCash('');
            setNote('');
            modal.showSuccess(
              'Checkout thành công',
              'Ca làm đã kết thúc. Vui lòng check-in để bắt đầu ca mới.',
              () => navigation.navigate('CashReport', { shiftId: currentShift.id }),
            );
          } catch (error: any) {
            snackbar.showError(error?.message || 'Checkout thất bại');
          } finally {
            setLoading(false);
          }
        },
        'Xác nhận kết ca',
      );
    } catch (error: any) {
      setLoading(false);
      snackbar.showError('Không thể tải báo cáo ca trước khi checkout. Vui lòng thử lại.');
    }
  };
  const isShiftOpen = !!(currentShift && currentShift.id);
  return (
    <View className="flex-1 bg-teal-700">
      <StatusBar barStyle="light-content" backgroundColor="#0f766e" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />
        <View className="flex-1 bg-white p-6">
          <Text className="text-2xl font-black text-teal-700 text-center mb-6">
            QUẢN LÝ CA LÀM
          </Text>
          <View className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
            <Text className="text-lg font-bold text-gray-800">
              Nhân viên: {user?.name}
            </Text>
            <Text className="mb-5 text-gray-500 text-sm italic">
              Vai trò: {user?.role}
            </Text>
            <Text className="mt-3 mb-2 font-bold text-gray-700">Số tiền (VNĐ)</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 text-base bg-white"
              placeholder="Nhập số tiền"
              value={cash}
              onChangeText={setCash}
              keyboardType="numeric"
            />
            <Text className="mt-4 mb-2 font-bold text-gray-700">Ghi chú</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-4 text-base bg-white"
              placeholder="Nhập ghi chú"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
            {}
            <TouchableOpacity
              className={`bg-teal-700 p-4 rounded-xl mt-6 items-center ${
                isShiftOpen ? 'opacity-50' : ''
              }`}
              onPress={handleCheckIn}
              disabled={loading || isShiftOpen}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold">Bắt đầu ca (Check-in)</Text>
              )}
            </TouchableOpacity>
            {}
            <TouchableOpacity
              className={`bg-red-600 p-4 rounded-xl mt-3 items-center ${
                !isShiftOpen ? 'opacity-50' : ''
              }`}
              onPress={handleCheckOut}
              disabled={loading || !isShiftOpen}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold">Kết thúc ca (Check-out)</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
      <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
      <AppModal {...modal.modalConfig} onDismiss={modal.hideModal} />
    </View>
  );
}
