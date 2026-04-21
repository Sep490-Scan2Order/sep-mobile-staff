import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '@/services/logicServices/authService';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { InlineError } from '@/components/InlineError';
import { validatePasswordPattern } from '@/utils/validation';
import { AppSnackbar } from '@/components/AppSnackbar';
import { AppModal } from '@/components/AppModal';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useAppModal } from '@/hooks/useAppModal';
export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const snackbar = useSnackbar();
  const modal = useAppModal();
  const validate = () => {
    let valid = true;
    setOtpError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    if (!otp.trim()) {
      setOtpError('Vui lòng nhập mã OTP');
      valid = false;
    }
    const passwordError = validatePasswordPattern(newPassword);
    if (passwordError) {
      setNewPasswordError(passwordError);
      valid = false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp');
      valid = false;
    }
    return valid;
  };
  const handleResetPassword = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const verifyResult = await authService.verifyForgotPasswordOtp(email, otp.trim());
      if (!verifyResult.success) {
        snackbar.showError(verifyResult.message || 'Mã OTP không hợp lệ');
        setIsLoading(false);
        return;
      }
      const resetToken = verifyResult.resetToken;
      const result = await authService.completeForgotPassword({
        email,
        newPassword,
        resetToken,
      });
      if (result.success) {
        modal.showSuccess(
          'Đặt lại mật khẩu thành công',
          'Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.',
          () => navigation.navigate('Login'),
        );
      } else {
        snackbar.showError(result.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (error) {
      snackbar.showError('Không thể đặt lại mật khẩu. Vui lòng thử lại.');
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
            <Text className="text-lg font-semibold text-gray-800 mb-2">Mã OTP</Text>
            <TextInput
              className={`bg-gray-200 rounded-2xl px-4 py-3 text-gray-800 ${otpError ? 'border border-red-400' : 'mb-2'}`}
              placeholder="Nhập mã OTP"
              value={otp}
              onChangeText={t => { setOtp(t); setOtpError(''); }}
              autoCapitalize="none"
              keyboardType="number-pad"
              editable={!isLoading}
            />
            <InlineError message={otpError} />
            <Text className="text-lg font-semibold text-gray-800 mb-2">Mật khẩu mới</Text>
            <View className="relative">
              <TextInput
                className={`bg-gray-200 rounded-2xl px-4 py-3 pr-12 text-gray-800 ${newPasswordError ? 'border border-red-400' : 'mb-2'}`}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChangeText={t => { setNewPassword(t); setNewPasswordError(''); }}
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
            <InlineError message={newPasswordError} />
            <Text className="text-lg font-semibold text-gray-800 mb-2">Xác nhận mật khẩu</Text>
            <TextInput
              className={`bg-gray-200 rounded-2xl px-4 py-3 text-gray-800 ${confirmPasswordError ? 'border border-red-400' : 'mb-6'}`}
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={t => { setConfirmPassword(t); setConfirmPasswordError(''); }}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <InlineError message={confirmPasswordError} />
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={isLoading}
              className={`rounded-2xl py-4 mt-2 ${isLoading ? 'bg-gray-400' : 'bg-[#226B5D]'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text testID="reset-button-text" className="text-white text-center font-bold text-lg">
                  Đặt lại mật khẩu
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppSnackbar {...snackbar.config} onDismiss={snackbar.hide} />
      <AppModal {...modal.modalConfig} onDismiss={modal.hideModal} />
    </SafeAreaView>
  );
}
