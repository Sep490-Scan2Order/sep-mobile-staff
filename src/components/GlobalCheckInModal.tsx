import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { checkInShift, setShift, fetchCurrentShift } from '@/store/slices/shiftSlice';
import { logout } from '@/store/slices/authSlice';
import { shiftService } from '@/services/logicServices/shiftService';
import { AppSnackbar } from '@/components/AppSnackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import { LogOut, CreditCard, ArrowRight } from 'lucide-react-native';
import { ShiftReportDto } from '@/type';
import { navigationRef, getCurrentRouteName } from '@/utils/navigationUtils';

export const GlobalCheckInModal = () => {
  const dispatch = useDispatch<any>();
  
  // Trạng thái theo dõi route hiện tại
  const [currentRoute, setCurrentRoute] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.userInfo);
  const currentShift = useSelector((state: RootState) => state.shift?.currentShift);
  const loading = useSelector((state: RootState) => state.shift?.loading);
  const hasFetchedStatus = useSelector((state: RootState) => state.shift?.hasFetchedStatus);
  
  const [note, setNote] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [pendingReport, setPendingReport] = useState<ShiftReportDto | null>(null);
  const snackbar = useSnackbar();

  // Polling hoặc listener để cập nhật route name vì modal nằm ngoài navigator
  useEffect(() => {
    const checkRoute = () => {
        const name = getCurrentRouteName();
        if (name !== currentRoute) {
            setCurrentRoute(name || null);
        }
    };
    
    // Lắng nghe thay đổi state từ navigationRef
    const unsubscribe = navigationRef.addListener('state', () => {
        checkRoute();
    });
    
    checkRoute();
    return unsubscribe;
  }, [currentRoute]);

  const fetchPending = useCallback(async () => {
    if (!user || user.role !== 'Cashier') return;
    try {
      const report = await shiftService.getPendingReport();
      setPendingReport(report);
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    if (!!user && !hasFetchedStatus) {
      dispatch(fetchCurrentShift());
    }
    if (!!user) {
      fetchPending();
    }
  }, [user, hasFetchedStatus, dispatch, fetchPending]);

  // Nếu đang ở trang nộp tiền thì KHÔNG hiện modal bảo vệ
  if (currentRoute === 'ShiftTransferScreen') return null;

  const isLocked = !!user && !currentShift && (user.role === 'Cashier' || user.role === 'Staff');

  if (!isLocked) return null;

  const handleCheckIn = async () => {
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
          note: note,
        }),
      ).unwrap();
      dispatch(setShift(result));
      setNote('');
    } catch (error: any) {
      let errorMsg = error?.message || 'Check-in thất bại';
      
      // Nếu là Nhân viên và gặp lỗi check-in (thường do chưa có ca Thu ngân)
      if (user?.role === 'Staff') {
        const lowerMsg = errorMsg.toLowerCase();
        if (
          lowerMsg.includes('ca làm việc') || 
          lowerMsg.includes('cashier') || 
          lowerMsg.includes('thu ngân') ||
          errorMsg === 'Check-in thất bại'
        ) {
          errorMsg = 'Không thể vào ca do hiện tại chưa có Thu ngân mở ca. Vui lòng liên hệ Thu ngân của quán.';
        }
      }
      
      snackbar.showError(errorMsg);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleNavigateToTransfer = () => {
    if (navigationRef.isReady()) {
        navigationRef.navigate('ShiftTransferScreen' as any);
    }
  };

  return (
    <Modal visible={isLocked} animationType="slide" transparent={false}>
      <View className="flex-1 bg-teal-700">
        <StatusBar barStyle="light-content" backgroundColor="#134e4a" />
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="flex-row items-center justify-between p-4 bg-teal-800">
            <View style={{ width: 40 }} />
            <Text className="text-xl font-bold text-white uppercase">Yêu cầu Check-in</Text>
            <TouchableOpacity onPress={handleLogout} className="p-1 items-center justify-center">
              <LogOut size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, justifyContent: 'center', flexGrow: 1 }}>
            <View className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm">
              <Text className="text-2xl font-black text-teal-800 text-center mb-2 uppercase">Bắt đầu ca làm việc</Text>
              <Text className="text-gray-500 text-center mb-8">Bạn cần check-in để truy cập các tính năng bên trong hệ thống.</Text>

              {pendingReport && user?.role === 'Cashier' && pendingReport.totalCashOrder > 0 && (
                <TouchableOpacity 
                   onPress={handleNavigateToTransfer}
                   className="mb-8 bg-orange-100 p-4 rounded-2xl border border-orange-200 flex-row items-center"
                >
                    <View className="bg-orange-500 p-2 rounded-full">
                        <CreditCard size={18} color="#fff" />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-orange-900 font-bold text-sm">Bạn có ca chưa nộp tiền</Text>
                        <Text className="text-orange-700 text-xs">Đi tới trang nộp tiền ngay</Text>
                    </View>
                    <ArrowRight size={18} color="#f97316" />
                </TouchableOpacity>
              )}

              <View className="bg-white rounded-2xl p-6 border border-teal-100 mb-8 items-center">
                <Text className="text-lg font-black text-gray-800 uppercase">{user?.name}</Text>
                <View className="bg-teal-50 px-3 py-1 rounded-full mt-2">
                    <Text className="text-teal-700 text-[10px] font-black uppercase">
                        Vai trò: {user?.role === 'Cashier' ? 'Thu ngân' : 'Nhân viên'}
                    </Text>
                </View>
              </View>

              <View className="mb-8">
                <Text className="mb-2 font-bold text-gray-700 ml-1">Ghi chú (Tùy chọn)</Text>
                <TextInput
                    className="border border-gray-200 rounded-2xl p-5 text-base bg-white text-gray-900 shadow-inner"
                    placeholder="Nhập ghi chú check-in..."
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                className="bg-teal-700 py-5 rounded-2xl items-center shadow-lg shadow-teal-900/30"
                onPress={handleCheckIn}
                disabled={isCheckingIn || loading}
              >
                {isCheckingIn || loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-black text-xl">VÀO CA NGAY</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
        <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
      </View>
    </Modal>
  );
};
