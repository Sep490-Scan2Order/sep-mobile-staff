import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchPendingReports } from '@/store/slices/shiftSlice';
import { shiftService } from '@/services/logicServices/shiftService';
import { AppSnackbar } from '@/components/AppSnackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import Animated, { FadeInDown, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { CreditCard, Info, CheckCircle2, ChevronLeft, Clock, Calendar } from 'lucide-react-native';
import { ShiftReportDto } from '@/type';

export default function ShiftTransferScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const snackbar = useSnackbar();
  const { pendingReports, loading: globalLoading } = useSelector(
    (state: RootState) => state.shift
  );

  const [loading, setLoading] = useState<number | null>(null);
  const [fetching, setFetching] = useState(false);
  const [qrData, setQrData] = useState<{ qrUrl: string; amount: number; shiftId: number } | null>(
    null
  );

  const loadData = useCallback(async () => {
    try {
      await dispatch(fetchPendingReports());
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    setFetching(true);
    loadData().finally(() => setFetching(false));
  }, [loadData]);

  useEffect(() => {
    let interval: any;
    if (pendingReports.length > 0) {
      interval = setInterval(() => {
        loadData();
      }, 5000); // Polling every 5 seconds
    } else {
      setQrData(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadData, pendingReports.length]);

  // Tự động ẩn QR khi ca đó đã nộp tiền thành công
  useEffect(() => {
    if (qrData) {
      const isStillPending = pendingReports.some(r => r.shiftId === qrData.shiftId);
      if (!isStillPending) {
        setQrData(null);
        snackbar.showSuccess(`Đối soát thành công ca #${qrData.shiftId}`);
      }
    }
  }, [pendingReports, qrData, snackbar]);

  const handleShowQr = async (shiftId: number) => {
    try {
      setLoading(shiftId);
      const res = await shiftService.getTransferQr(shiftId);
      if (res && res.qrUrl) {
        setQrData({ qrUrl: res.qrUrl, amount: res.amount, shiftId });
      } else {
        snackbar.showError('Không lấy được thông tin mã QR');
      }
    } catch (error: any) {
      snackbar.showError(error.message || 'Không thể lấy mã QR');
    } finally {
      setLoading(null);
    }
  };

  const formatCurrency = (value: any) => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toLocaleString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('vi-VN');
    const timePart = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return { datePart, timePart };
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row items-center p-4 border-b border-gray-100">
           <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
              <ChevronLeft size={24} color="#374151" />
           </TouchableOpacity>
           <Text className="text-xl font-black text-gray-800 ml-2 uppercase">Danh sách nộp tiền</Text>
        </View>

        <ScrollView className="flex-1 p-6">
          {fetching && pendingReports.length === 0 ? (
            <View className="py-20 justify-center items-center">
              <ActivityIndicator color="#0f766e" size="large" />
              <Text className="mt-4 text-gray-500">Đang tìm báo cáo ca...</Text>
            </View>
          ) : pendingReports.length > 0 ? (
            <View>
                <View className="mb-6 flex-row items-start p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <Info size={20} color="#3b82f6" />
                  <Text className="ml-3 text-blue-700 text-xs flex-1 leading-5">
                    Vui lòng chọn từng ca bên dưới để thực hiện nộp tiền. Hệ thống sẽ tự động cập nhật trạng thái khi nhận được tiền.
                  </Text>
                </View>

                {pendingReports.map((report, index) => {
                    const { datePart, timePart } = formatDateTime(report.reportDate);
                    const isSelected = qrData?.shiftId === report.shiftId;

                    return (
                        <Animated.View 
                            key={report.shiftId} 
                            entering={FadeInDown.delay(index * 100).duration(400)}
                            className={`mb-4 rounded-3xl border ${isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-white shadow-sm'} overflow-hidden`}
                        >
                            <View className="p-5">
                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="flex-row items-center">
                                        <View className={`p-2 rounded-full ${isSelected ? 'bg-teal-500' : 'bg-orange-500'}`}>
                                            <CreditCard size={16} color="#fff" />
                                        </View>
                                        <Text className="ml-2 font-black text-gray-800">Ca làm #{report.shiftId}</Text>
                                    </View>
                                    <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-lg">
                                        <Clock size={12} color="#6b7280" />
                                        <Text className="ml-1 text-[10px] text-gray-500 font-bold">{timePart} - {datePart}</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-end">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] uppercase font-black">Số tiền cần nộp</Text>
                                        <Text className="text-xl font-black text-teal-800">{formatCurrency(report.totalCashOrder)} đ</Text>
                                    </View>
                                    
                                    <TouchableOpacity
                                        className={`${isSelected ? 'bg-teal-800' : 'bg-teal-700'} px-4 py-3 rounded-xl`}
                                        onPress={() => handleShowQr(report.shiftId)}
                                        disabled={loading !== null}
                                    >
                                        {loading === report.shiftId ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text className="text-white font-bold text-xs uppercase">
                                                {isSelected ? 'Đang hiện QR' : 'Nộp tiền ngay'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    );
                })}
            </View>
          ) : (
            <Animated.View entering={FadeInUp.duration(500)} className="py-20 items-center">
              <View className="bg-green-50 p-8 rounded-full mb-6">
                <CheckCircle2 size={100} color="#10b981" />
              </View>
              <Text className="text-xl font-black text-gray-800 text-center mb-2">
                HOÀN TẤT ĐỐI SOÁT
              </Text>
              <Text className="text-gray-500 text-center px-10 leading-6">
                Bạn không có yêu cầu nộp tiền nào chưa hoàn tất. Bạn có thể quay lại để bắt đầu ca mới.
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                className="mt-10 bg-gray-100 px-10 py-4 rounded-2xl"
              >
                  <Text className="text-gray-700 font-bold">QUAY LẠI</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {qrData && (
            <Animated.View 
              entering={FadeInUp.duration(300)}
              exiting={FadeOutUp.duration(300)}
              className="mt-6 mb-10 bg-gray-50 rounded-3xl p-6 items-center border border-gray-100"
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-teal-100 p-2 rounded-full mr-2">
                    <Calendar size={16} color="#0f766e" />
                </View>
                <Text className="text-gray-600 font-bold">QR cho Ca #{qrData.shiftId}</Text>
              </View>

              <Text className="text-teal-700 font-black text-2xl mb-6">{formatCurrency(qrData.amount)} đ</Text>
              
              <View className="bg-white p-4 rounded-3xl shadow-xl mb-6">
                {qrData.qrUrl ? (
                  <Image 
                    source={{ uri: qrData.qrUrl }} 
                    style={{ width: 260, height: 260 }} 
                    resizeMode="contain" 
                  />
                ) : (
                  <ActivityIndicator color="#0f766e" />
                )}
              </View>

              <Text className="text-gray-500 text-center text-xs px-6 mb-4 leading-5 italic">
                Dùng ứng dụng Ngân hàng để quét và chuyển khoản. Nội dung chuyển khoản đã được tích hợp sẵn trong mã.
              </Text>

              <TouchableOpacity 
                onPress={() => setQrData(null)}
                className="bg-gray-800 px-12 py-4 rounded-2xl"
              >
                <Text className="text-white font-bold">ĐÓNG MÃ QR</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
      <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
    </View>
  );
}
