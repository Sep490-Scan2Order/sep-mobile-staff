import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Image,
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
  fetchStaffShifts,
} from '@/store/slices/shiftSlice';
import { Header } from '@/components/Header';
import { AppSnackbar } from '@/components/AppSnackbar';
import { AppModal } from '@/components/AppModal';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useAppModal } from '@/hooks/useAppModal';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { CreditCard, Info, AlertTriangle, ArrowRight, User as UserIcon, Lock, Unlock } from 'lucide-react-native';
import { ShiftReportDto } from '@/type';

export default function CheckInScreen() {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.userInfo);
  const currentShift = useSelector(
    (state: RootState) => state.shift.currentShift,
  );
  const staffShifts = useSelector((state: RootState) => state.shift.staffShifts) || [];
  
  const [pendingReport, setPendingReport] = useState<ShiftReportDto | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const snackbar = useSnackbar();
  const modal = useAppModal();

  const formatCurrency = (value: any) => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toLocaleString('vi-VN');
  };

  const fetchPendingReport = useCallback(async () => {
    if (!user?.id) return;
    try {
      const report = await shiftService.getPendingReport();
      setPendingReport(report);
    } catch (error) {
      console.log('Error fetching pending report:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(fetchCurrentShift());
    fetchPendingReport();
  }, [user?.id, dispatch, fetchPendingReport]);

  useEffect(() => {
    if (user?.role === 'Cashier' && currentShift?.id) {
      dispatch(fetchStaffShifts(currentShift.id));
    }
  }, [user?.role, currentShift?.id, dispatch]);

  const handleCheckIn = async () => {
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
          note: note,
        }),
      ).unwrap();
      dispatch(setShift(result));
      setNote('');
      snackbar.showSuccess('Check-in thành công! Ca làm đã bắt đầu.');
    } catch (error: any) {
      snackbar.showError(error?.message || 'Check-in thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentShift?.id) {
      snackbar.showError('Không tìm thấy ca làm hiện tại');
      return;
    }
    try {
      setLoading(true);
      const report = await shiftService.getPreview(currentShift.id);
      setLoading(false);
      const expected = report.expectedCashAmount || 0;
      const msg = `Chi tiết ca làm:\n- Doanh thu Tiền mặt: ${formatCurrency(report.totalCashOrder)} đ\n- Doanh thu Chuyển khoản: ${formatCurrency(report.totalTransferOrder)} đ\n- Tổng Hoàn tiền: ${formatCurrency(report.totalRefundAmount)} đ\n\nTiền mặt thực tế thu được (Hệ thống): ${formatCurrency(expected)} đ\n\nBạn có chắc chắn kết thúc ca?`;
      
      modal.showConfirm(
        'BÁO CÁO KẾT CA',
        msg,
        async () => {
          try {
            setLoading(true);
            await shiftService.checkOut({
              shiftId: currentShift.id,
              note: note,
            });
            dispatch(clearShift());
            setNote('');
            modal.showSuccess(
              'Checkout thành công',
              'Ca làm đã kết thúc. Vui lòng thực hiện nộp tiền doanh thu.',
              () => {
                 navigation.navigate('ShiftTransferScreen');
              } 
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
      snackbar.showError('Không thể tải báo cáo ca trước khi checkout.');
    }
  };

  const handleToggleBlock = async (shift: any) => {
    try {
      setActionLoading(shift.id.toString());
      await shiftService.blockShift(shift.id);
      snackbar.showSuccess(`${shift.isBlocked ? 'Mở khóa' : 'Khóa'} nhân viên thành công`);
      // SignalR will handle the refresh, but we can also re-fetch manually
      if (currentShift?.id) {
        dispatch(fetchStaffShifts(currentShift.id));
      }
    } catch (error: any) {
      snackbar.showError(error?.message || 'Thao tác thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const isShiftOpen = !!(currentShift && currentShift.id);

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />
        
        <ScrollView className="flex-1 px-6">
          <Text className="text-2xl font-black text-teal-800 text-center my-6 uppercase">
            Quản lý ca làm việc
          </Text>

          {pendingReport && !isShiftOpen && (
            <View className="mb-6">
              <TouchableOpacity 
                onPress={() => navigation.navigate('ShiftTransferScreen')}
                className="bg-orange-50 p-5 rounded-3xl border border-orange-100 flex-row items-center shadow-sm"
              >
                <View className="bg-orange-500 p-3 rounded-full">
                  <CreditCard size={20} color="#fff" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-orange-900 font-black">Nộp tiền doanh thu ca trước</Text>
                  <Text className="text-orange-700 text-xs mt-1">Số tiền: {formatCurrency(pendingReport.totalCashOrder)} đ</Text>
                </View>
                <ArrowRight size={20} color="#f97316" />
              </TouchableOpacity>
            </View>
          )}

          <View 
            className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm mb-10"
          >
            <View className="flex-row justify-between items-center mb-6">
               <View>
                  <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">Trạng thái</Text>
                  <Text className="text-xl font-black text-teal-800">
                    {isShiftOpen ? 'ĐANG TRONG CA' : 'CHƯA VÀO CA'}
                  </Text>
               </View>
               <View className={`p-2 rounded-full ${isShiftOpen ? 'bg-teal-100' : 'bg-gray-200'}`}>
                  <View className={`w-3 h-3 rounded-full ${isShiftOpen ? 'bg-teal-500' : 'bg-gray-400'}`} />
               </View>
            </View>

            {isShiftOpen ? (
              <View>
                <View className="bg-white p-5 rounded-2xl border border-teal-50 mb-6">
                  <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Thông tin nhân viên</Text>
                  <Text className="text-gray-800 font-bold">{user?.name}</Text>
                  <Text className="text-gray-500 text-xs mt-1 italic">
                    Bắt đầu: {new Date(currentShift.startDate).toLocaleString('vi-VN')}
                  </Text>
                </View>

                <Text className="mb-2 font-bold text-gray-700 ml-1">Ghi chú kết ca</Text>
                <TextInput
                  className="border border-gray-200 rounded-2xl p-5 text-base bg-white shadow-inner"
                  placeholder="Nhập ghi chú checkout..."
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={2}
                />

                <TouchableOpacity
                  className="bg-red-600 p-5 rounded-2xl mt-8 flex-row justify-center items-center shadow-lg shadow-red-900/20"
                  onPress={handleCheckOut}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-black text-lg">KẾT THÚC CA (CHECK-OUT)</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="bg-white p-5 rounded-2xl border border-teal-50 mb-6">
                  <Text className="text-gray-700 leading-6 italic">
                    Chào mừng <Text className="font-bold text-teal-800">{user?.name}</Text>, hãy nhấn nút bên dưới để bắt đầu ca làm việc của bạn.
                  </Text>
                </View>

                <Text className="mb-2 font-bold text-gray-700 ml-1">Ghi chú (Tùy chọn)</Text>
                <TextInput
                  className="border border-gray-200 rounded-2xl p-5 text-base bg-white shadow-inner"
                  placeholder="Ghi chú check-in..."
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={2}
                />

                <TouchableOpacity
                  className="bg-teal-700 p-5 rounded-2xl mt-8 flex-row justify-center items-center shadow-lg shadow-teal-900/20"
                  onPress={handleCheckIn}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-black text-lg">BẮT ĐẦU CA (CHECK-IN)</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isShiftOpen && user?.role === 'Cashier' && (
             <View className="mb-10">
                <Text className="text-lg font-black text-teal-800 mb-4 uppercase ml-1">Nhân viên trong ca</Text>
                {staffShifts.length === 0 ? (
                  <View className="bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-300 items-center">
                    <Text className="text-gray-400 italic text-sm">Chưa có nhân viên nào check-in</Text>
                  </View>
                ) : (
                  staffShifts.map((staffShift, index) => (
                    <View key={staffShift.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center mb-3">
                      <View className={`w-12 h-12 rounded-full items-center justify-center ${staffShift.isBlocked ? 'bg-red-50' : 'bg-teal-50'}`}>
                        <UserIcon size={20} color={staffShift.isBlocked ? '#ef4444' : '#0d9488'} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="font-bold text-gray-800" numberOfLines={1}>{staffShift.staffName}</Text>
                        <Text className="text-[10px] text-gray-500 italic mt-0.5">Vào ca: {new Date(staffShift.startDate).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <View className={`px-2 py-1 rounded-full mr-3 ${staffShift.isBlocked ? 'bg-red-100' : 'bg-green-100'}`}>
                          <Text className={`text-[9px] font-black uppercase ${staffShift.isBlocked ? 'text-red-700' : 'text-green-700'}`}>
                            {staffShift.isBlocked ? 'Đã khóa' : 'Đang trực'}
                          </Text>
                        </View>
                        
                        <TouchableOpacity 
                          onPress={() => handleToggleBlock(staffShift)}
                          disabled={actionLoading === staffShift.id.toString()}
                          className={`p-2 rounded-xl border ${staffShift.isBlocked ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                        >
                          {actionLoading === staffShift.id.toString() ? (
                            <ActivityIndicator size="small" color={staffShift.isBlocked ? '#166534' : '#991b1b'} />
                          ) : (
                            staffShift.isBlocked ? <Unlock size={18} color="#166534" /> : <Lock size={18} color="#991b1b" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
             </View>
          )}

          {!isShiftOpen && (
            <View className="flex-row items-center p-4 bg-teal-50 rounded-2xl">
               <Info size={20} color="#0f766e" />
               <Text className="ml-3 text-teal-800 text-xs italic flex-1">
                  Mọi thông tin doanh thu nhạy cảm sẽ bị ẩn cho tới khi bạn thực hiện Check-in thành công.
               </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
      <AppModal {...modal.modalConfig} onDismiss={modal.hideModal} />
    </View>
  );
}
