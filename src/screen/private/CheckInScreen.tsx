import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { shiftService } from '../../services/logicServices/shiftService';
import { checkInShift, clearShift } from '../../store/slices/shiftSlice';
import { Header } from '../../components/Header';

export default function CheckInScreen() {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();

  const user = useSelector((state: RootState) => state.auth.userInfo);

  const currentShiftId = useSelector(
    (state: RootState) => state.shift.currentShiftId,
  );

  const [cash, setCash] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!cash) {
      Alert.alert('Thông báo', 'Vui lòng nhập số tiền đầu ca');
      return;
    }

    if (!user) {
      Alert.alert('Lỗi', 'Thông tin người dùng không khả dụng. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setLoading(true);

      await dispatch(
        checkInShift({
          restaurantId: user.restaurantId!,
          staffId: user.id!,
          openingCashAmount: Number(cash),
          note: note,
        }),
      ).unwrap();

      Alert.alert('Thành công', 'Check-in thành công');
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Check-in thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!cash) {
      Alert.alert('Thông báo', 'Vui lòng nhập tiền cuối ca');
      return;
    }

    if (!currentShiftId) {
      Alert.alert('Lỗi', 'Không tìm thấy ca làm hiện tại');
      return;
    }

    try {
      setLoading(true);

      const savedShiftId = currentShiftId;

      await shiftService.checkOut({
        shiftId: currentShiftId,
        cashAmount: Number(cash),
        note: note,
      });

      dispatch(clearShift());

      Alert.alert(
        'Thành công',
        'Checkout ca làm thành công. Đang chuyển sang báo cáo chi tiết...',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('CashReport', { shiftId: savedShiftId });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Checkout thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-teal-700">
      <StatusBar barStyle="light-content" backgroundColor="#134e4a" /> {/* teal-900 roughly */}
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />

        <View className="flex-1 bg-white p-6">
          <Text className="text-2xl font-black text-teal-700 text-center mb-6">QUẢN LÝ CA LÀM</Text>

          <View className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
            <Text className="text-lg font-bold text-gray-800">Nhân viên: {user?.name}</Text>
            <Text className="mb-5 text-gray-500 text-sm italic">Vai trò: {user?.role}</Text>

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

            <TouchableOpacity
              className={`bg-teal-700 p-4 rounded-xl mt-6 items-center shadow-md ${!!currentShiftId ? 'opacity-50' : ''}`}
              onPress={handleCheckIn}
              disabled={loading || !!currentShiftId}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Bắt đầu ca (Check-in)</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className={`bg-red-600 p-4 rounded-xl mt-3 items-center shadow-md ${!currentShiftId ? 'opacity-50' : ''}`}
              onPress={handleCheckOut}
              disabled={loading || !currentShiftId}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Kết thúc ca (Check-out)</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
