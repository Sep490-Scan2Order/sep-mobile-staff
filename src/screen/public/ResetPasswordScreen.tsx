import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '@/services/logicServices/authService';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email } = route.params;

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      // Step 2: Verify OTP and get ResetToken
      const verifyResult = await authService.verifyForgotPasswordOtp(email, otp.trim());
      
      if (!verifyResult.success) {
        Alert.alert('Lỗi', verifyResult.message || 'Mã OTP không hợp lệ');
        setIsLoading(false);
        return;
      }

      const resetToken = verifyResult.resetToken;

      // Step 3: Complete Forgot Password
      const result = await authService.completeForgotPassword({
        email,
        newPassword,
        resetToken,
      });

      if (result.success) {
        Alert.alert('Thành công', 'Mật khẩu đã được đặt lại', [
          {
            text: 'Đến trang Đăng nhập',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        Alert.alert('Lỗi', result.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#226B5D]">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="px-6 py-4"
      >
        <ChevronLeft size={30} color="white" />
      </TouchableOpacity>

      <KeyboardAvoidingView behavior={'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
          <View className="mt-6 mb-10 items-center">
            <Text className="text-3xl font-bold text-white text-center">
              Đặt lại mật khẩu
            </Text>
            <Text className="text-white mt-2 text-center">
              Vui lòng nhập mã OTP gửi tới {email} và mật khẩu mới
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-6 shadow-lg mb-10">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Mã OTP
            </Text>
            <TextInput
              className="bg-gray-200 rounded-2xl px-4 py-3 mb-4 text-gray-800"
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={setOtp}
              autoCapitalize="none"
              keyboardType="number-pad"
              editable={!isLoading}
            />

            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Mật khẩu mới
            </Text>
            <View className="relative mb-4">
              <TextInput
                className="bg-gray-200 rounded-2xl px-4 py-3 pr-12 text-gray-800"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3"
              >
                {showPassword ? (
                  <Eye size={24} color="#333" />
                ) : (
                  <EyeOff size={24} color="#333" />
                )}
              </TouchableOpacity>
            </View>

            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Xác nhận mật khẩu
            </Text>
            <TextInput
              className="bg-gray-200 rounded-2xl px-4 py-3 mb-6 text-gray-800"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={isLoading}
              className={`rounded-2xl py-4 ${
                isLoading ? 'bg-gray-400' : 'bg-[#226B5D]'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Đặt lại mật khẩu
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
