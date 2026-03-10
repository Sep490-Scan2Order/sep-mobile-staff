import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { shiftService } from '../../services/logicServices/shiftService';
import { checkInShift } from '../../store/slices/shiftSlice';

export default function CheckInScreen() {
  const dispatch = useDispatch<any>();

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

    try {
      setLoading(true);

      await dispatch(
        checkInShift({
          restaurantId: user.restaurantId,
          staffId: user.id,
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

      await shiftService.checkOut({
        shiftId: currentShiftId,
        cashAmount: Number(cash),
        note: note,
      });

      Alert.alert('Thành công', 'Checkout ca làm thành công');
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Checkout thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản Lý Ca Làm</Text>

      <View style={styles.card}>
        <Text style={styles.staff}>Nhân viên: {user?.name}</Text>
        <Text style={styles.role}>Role: {user?.role}</Text>

        <Text style={styles.label}>Số tiền</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập số tiền"
          value={cash}
          onChangeText={setCash}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Ghi chú</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập ghi chú"
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity
          style={[styles.checkInButton, currentShiftId && { opacity: 0.5 }]}
          onPress={handleCheckIn}
          disabled={loading || !!currentShiftId}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Check In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkOutButton, !currentShiftId && { opacity: 0.5 }]}
          onPress={handleCheckOut}
          disabled={loading || !currentShiftId}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Check Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PRIMARY = '#226B5D';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    padding: 20,
  },

  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },

  staff: {
    fontSize: 18,
    fontWeight: '600',
  },

  role: {
    marginBottom: 15,
    color: '#666',
  },

  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },

  checkInButton: {
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },

  checkOutButton: {
    backgroundColor: '#e74c3c',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
