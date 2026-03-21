import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { shiftService } from '../../services/logicServices/shiftService';
import { ShiftReportDto } from '../../services/apiEndpoints/shiftApi';
import { HistoryCard } from '../../components/HistoryCard';
import { Header } from '../../components/Header';
import { AlertCircle, Clock, ChevronLeft, Calendar } from 'lucide-react-native';

const PRIMARY_COLOR_CLASS = 'bg-teal-700';

/**
 * Màn hình Báo cáo & Lịch sử ca làm.
 * Layout vuông vức, không bo tròn, đồng bộ với KDS.
 */
const CashReportScreen = ({ route }: any) => {
  const paramShiftId = route?.params?.shiftId;
  const user = useSelector((state: RootState) => state.auth.userInfo);

  const [report, setReport] = useState<ShiftReportDto | null>(null);
  const [history, setHistory] = useState<ShiftReportDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSingleReport = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await shiftService.getReport(id);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Không tìm thấy báo cáo cho ca này.');
      setReport(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchStaffHistory = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await shiftService.getReportsByStaff(user.id);
      setHistory(data || []);
      setReport(null);
    } catch (err: any) {
      setError(err.message || 'Không thể lấy lịch sử báo cáo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (paramShiftId) {
      fetchSingleReport(paramShiftId);
    } else {
      fetchStaffHistory();
    }
  }, [paramShiftId, fetchSingleReport, fetchStaffHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    if (report) {
      fetchSingleReport(report.shiftId);
    } else {
      fetchStaffHistory();
    }
  };

  const formatCurrency = (value: any) => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toLocaleString('vi-VN');
  };

  const renderDetail = () => (
    <View className="flex-1 bg-gray-50">
      <TouchableOpacity 
        onPress={() => fetchStaffHistory()}
        className="mx-6 my-4 flex-row items-center"
      >
        <ChevronLeft size={20} color="#0f766e" />
        <Text className="text-teal-700 ml-1 font-bold text-base">Quay lại lịch sử</Text>
      </TouchableOpacity>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />}
      >
        {report && (
          <View className="mx-5 bg-white p-6 shadow-sm border border-gray-100">
            <View className="items-center mb-6">
              <View className="bg-teal-50 px-4 py-2 rounded-lg border border-teal-100">
                <Text className="text-teal-700 font-black text-lg">BÁO CÁO CA #{report.shiftId}</Text>
              </View>
              <View className="flex-row items-center mt-3">
                <Calendar size={14} color="#9ca3af" />
                <Text className="text-gray-400 text-sm ml-2">
                  {new Date(report.reportDate).toLocaleString('vi-VN')}
                </Text>
              </View>
            </View>

            <View className="gap-4">
              {[
                { label: 'Tiền mặt doanh thu', value: report.totalCashOrder },
                { label: 'Chuyển khoản doanh thu', value: report.totalTransferOrder },
                { label: 'Tổng hoàn tiền', value: report.totalRefundAmount, isRefund: true },
              ].map((item, idx) => (
                <View key={idx} className="flex-row justify-between items-center py-3 border-b border-gray-50">
                  <Text className="text-gray-500 text-base">{item.label}</Text>
                  <Text className={`font-bold text-lg ${item.isRefund ? 'text-orange-600' : 'text-gray-900'}`}>
                    {item.isRefund ? '-' : ''}{formatCurrency(item.value)} đ
                  </Text>
                </View>
              ))}

              <View className="mt-4 bg-teal-50/30 p-5 rounded-xl gap-3">
                 <View className="flex-row justify-between">
                  <Text className="text-gray-600 font-semibold">Tiền mặt dự kiến</Text>
                  <Text className="font-bold text-gray-900 text-lg">{formatCurrency(report.expectedCashAmount)} đ</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 font-semibold">Thực tế bàn giao</Text>
                  <Text className="font-black text-teal-700 text-xl">{formatCurrency(report.actualCashAmount)} đ</Text>
                </View>
              </View>

              <View className={`mt-4 p-5 items-center ${
                report.difference == 0 ? 'bg-emerald-50' : Number(report.difference) > 0 ? 'bg-blue-50' : 'bg-red-50'
              }`}>
                <Text className="text-gray-400 text-xs font-black tracking-widest mb-1">CHÊNH LỆCH</Text>
                <Text className={`text-2xl font-black ${
                  report.difference == 0 ? 'text-emerald-700' : Number(report.difference) > 0 ? 'text-blue-700' : 'text-red-700'
                }`}>
                  {report.difference == 0 ? 'HOÀN TOÀN KHỚP ✔' : `${formatCurrency(report.difference)} đ`}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderHistory = () => (
    <View className="flex-1 bg-white">
      <View className="px-6 mt-5 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Clock size={20} color="#0f766e" />
          <Text className="text-xl font-black text-gray-900 ml-2">Lịch sử ca làm</Text>
        </View>
        <Text className="bg-gray-100 px-3 py-1 rounded-full text-gray-500 text-xs font-bold">{history.length} CA</Text>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />}
      >
        {history.length === 0 ? (
          <View className="mt-20 items-center px-10">
            <Clock size={60} color="#e5e7eb" />
            <Text className="text-gray-400 text-center mt-4 text-base font-medium">
              Không có dữ liệu lịch sử ca làm.
            </Text>
          </View>
        ) : (
          history.map((item, index) => (
            <TouchableOpacity key={index} activeOpacity={0.85} onPress={() => setReport(item)}>
              <HistoryCard 
                employee={user?.name || 'Nhân viên'}
                restaurant={user?.restaurantName || 'Nhà hàng'}
                {...item}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-teal-700">
      <StatusBar barStyle="light-content" backgroundColor="#134e4a" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />
        
        <View className="flex-1 bg-white">
          {loading && !refreshing ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#0f766e" />
            </View>
          ) : error ? (
            <View className="flex-1 justify-center items-center p-10">
              <AlertCircle size={60} color="#ef4444" />
              <Text className="text-red-500 text-center mt-4 font-bold">{error}</Text>
              <TouchableOpacity onPress={onRefresh} className="mt-8 bg-teal-700 px-8 py-3 rounded-xl shadow-lg">
                 <Text className="text-white font-bold">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : report ? renderDetail() : renderHistory()}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default CashReportScreen;
