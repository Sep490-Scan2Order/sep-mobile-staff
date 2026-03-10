import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '../../services/logicServices/authService';

export default function ChangePasswordScreen() {
  const route = useRoute<any>();
  const { email } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const navigation = useNavigation();
  useEffect(() => {
    sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendOtp = async () => {
    const result = await authService.sendEmailOtp(email);
    console.log('Send OTP Result:', result);

    if (!result.success) {
      Alert.alert('Lỗi', result.message);
      return;
    }

    Alert.alert('OTP đã gửi', 'Vui lòng kiểm tra email của bạn');
  };

  const handleResetPassword = async () => {
    const body = {
      email,
      newPassword,
      resetToken,
    };

    console.log('Reset Password Request:', body);
    try {
      const response = await authService.resetPassword(body);
      console.log('Reset Password Response:', response);
      if (response?.success) {
        Alert.alert('Thành công', 'Mật khẩu đã được đổi thành công', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Lỗi', response?.message || 'Không thể đổi mật khẩu');
      }
    } catch (error) {
      console.log('Reset Password Error:', error);
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu');
    }
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center px-6">
      <View className="bg-white p-6 rounded-2xl shadow">
        <Text className="text-xl font-bold text-center mb-6">Đổi mật khẩu</Text>

        <Text className="text-gray-600 mb-2">Email</Text>

        <TextInput
          value={email}
          editable={false}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-100"
        />

        <Text className="text-gray-600 mb-2">Mật khẩu mới</Text>

        <TextInput
          placeholder="Nhập mật khẩu mới"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
        />

        <Text className="text-gray-600 mb-2">OTP</Text>

        <TextInput
          placeholder="Nhập mã OTP"
          value={resetToken}
          onChangeText={setResetToken}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6"
        />

        <TouchableOpacity
          onPress={handleResetPassword}
          className="bg-emerald-600 py-3 rounded-xl"
        >
          <Text className="text-white text-center font-semibold">
            Đổi mật khẩu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
