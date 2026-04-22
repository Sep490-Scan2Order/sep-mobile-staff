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
import { fetchPendingReport } from '@/store/slices/shiftSlice';
import { shiftService } from '@/services/logicServices/shiftService';
import { Header } from '@/components/Header';
import { AppSnackbar } from '@/components/AppSnackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
import Animated, { FadeInDown, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { CreditCard, Info, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import { ShiftReportDto } from '@/type';

export default function ShiftTransferScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const snackbar = useSnackbar();
  const { pendingReport, loading: globalLoading } = useSelector(
    (state: RootState) => state.shift
  );

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [qrData, setQrData] = useState<{ qrUrl: string; amount: number } | null>(
    null
  );

  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        await dispatch(fetchPendingReport());
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    let interval: any;
    if (pendingReport && pendingReport.totalCashOrder > 0) {
      interval = setInterval(() => {
        dispatch(fetchPendingReport());
      }, 5000); // Polling every 5 seconds
    } else {
      // Clear QR data if no report or completed
      setQrData(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dispatch, pendingReport]);

  const handleShowQr = async (shiftId: number) => {
    try {
      setLoading(true);
      const res = await shiftService.getTransferQr(shiftId);
      if (res && res.qrUrl) {
        setQrData({ qrUrl: res.qrUrl, amount: res.amount });
      } else {
        snackbar.showError('Không lấy được thông tin mã QR');
      }
    } catch (error: any) {
      snackbar.showError(error.message || 'Không thể lấy mã QR');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: any) => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toLocaleString('vi-VN');
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row items-center p-4 border-b border-gray-100">
           <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
              <ChevronLeft size={24} color="#374151" />
           </TouchableOpacity>
           <Text className="text-xl font-black text-gray-800 ml-2 uppercase">Đối soát nộp tiền</Text>
        </View>

        <ScrollView className="flex-1 p-6">
          {fetching ? (
            <View className="py-20 justify-center items-center">
              <ActivityIndicator color="#0f766e" size="large" />
              <Text className="mt-4 text-gray-500">Đang tìm báo cáo ca...</Text>
            </View>
          ) : (pendingReport && pendingReport.totalCashOrder > 0) ? (
            <Animated.View entering={FadeInDown.duration(400)}>
              <View className="bg-orange-50 p-6 rounded-3xl border border-orange-100 shadow-sm mb-6">
                <View className="flex-row items-center mb-6">
                  <View className="bg-orange-100 p-3 rounded-full">
                    <CreditCard size={28} color="#f97316" />
                  </View>
                  <View className="ml-4">
                    <Text className="text-lg font-black text-gray-900">Yêu cầu nộp tiền</Text>
                    <Text className="text-gray-500 text-sm italic">Ca làm #{pendingReport.shiftId}</Text>
                  </View>
                </View>

                <View className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 mb-6">
                  <View className="flex-row justify-between mb-4 border-b border-gray-50 pb-2">
                    <Text className="text-gray-500">Ngày báo cáo:</Text>
                    <Text className="text-gray-900 font-bold">
                      {new Date(pendingReport.reportDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-700 font-bold">Số tiền cần nộp:</Text>
                    <Text className="text-2xl font-black text-teal-700">
                      {formatCurrency(pendingReport.totalCashOrder)} đ
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-teal-700 p-5 rounded-2xl flex-row justify-center items-center shadow-lg shadow-teal-900/20"
                  onPress={() => handleShowQr(pendingReport.shiftId)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-black text-lg">HIỆN MÃ QR NỘP TIỀN</Text>
                  )}
                </TouchableOpacity>

                <View className="mt-8 flex-row items-start p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <Info size={20} color="#3b82f6" />
                  <Text className="ml-3 text-blue-700 text-xs flex-1 leading-5">
                    Hệ thống sẽ tự động đối soát khi tiền vào tài khoản. Sau khi nộp thành công, bạn có thể thực hiện Check-in ca mới.
                  </Text>
                </View>
              </View>
            </Animated.View>
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
              className="mt-10 bg-gray-50 rounded-3xl p-6 items-center border border-gray-100"
            >
              <Text className="text-lg font-black text-gray-900 mb-2 uppercase">Mã QR Chuyển khoản</Text>
              <Text className="text-teal-700 font-black text-xl mb-6">{formatCurrency(qrData.amount)} đ</Text>
              
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
                <Text className="text-white font-bold">ĐÃ HIỂU</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
      <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
    </View>
  );
}
