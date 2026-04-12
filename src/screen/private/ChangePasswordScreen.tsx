import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '@/services/logicServices/authService';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InlineError } from '@/components/InlineError';
import { AppSnackbar } from '@/components/AppSnackbar';
import { AppModal } from '@/components/AppModal';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useAppModal } from '@/hooks/useAppModal';

export default function ChangePasswordScreen() {
  const route = useRoute<any>();
  const { email } = route.params;
  const navigation = useNavigation();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Inline validation errors
  const [oldPasswordError, setOldPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const snackbar = useSnackbar();
  const modal = useAppModal();

  const validate = () => {
    let valid = true;
    setOldPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!oldPassword.trim()) {
      setOldPasswordError('Vui lòng nhập mật khẩu cũ');
      valid = false;
    }
    if (newPassword.length < 6) {
      setNewPasswordError('Mật khẩu mới phải ít nhất 6 ký tự');
      valid = false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp');
      valid = false;
    }
    return valid;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const result = await authService.changePassword({
        email,
        oldPassword,
        newPassword,
      });

      if (result.success) {
        modal.showSuccess(
          'Đổi mật khẩu thành công',
          'Mật khẩu của bạn đã được cập nhật.',
          () => navigation.goBack(),
        );
      } else {
        snackbar.showError(result.message || 'Không thể đổi mật khẩu');
      }
    } catch (error) {
      snackbar.showError('Không thể đổi mật khẩu. Vui lòng thử lại.');
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
              Đổi mật khẩu
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-6 shadow-lg">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Email</Text>
            <TextInput
              value={email}
              editable={false}
              className="bg-gray-100 rounded-2xl px-4 py-3 mb-4 text-gray-500"
            />

            <Text className="text-lg font-semibold text-gray-800 mb-2">Mật khẩu cũ</Text>
            <TextInput
              placeholder="Nhập mật khẩu cũ"
              secureTextEntry
              value={oldPassword}
              onChangeText={t => { setOldPassword(t); setOldPasswordError(''); }}
              className={`bg-gray-200 rounded-2xl px-4 py-3 text-gray-800 ${oldPasswordError ? 'border border-red-400' : 'mb-2'}`}
              editable={!isLoading}
            />
            <InlineError message={oldPasswordError} />

            <Text className="text-lg font-semibold text-gray-800 mb-2">Mật khẩu mới</Text>
            <View className="relative">
              <TextInput
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={t => { setNewPassword(t); setNewPasswordError(''); }}
                className={`bg-gray-200 rounded-2xl px-4 py-3 pr-12 text-gray-800 ${newPasswordError ? 'border border-red-400' : 'mb-2'}`}
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

            <Text className="text-lg font-semibold text-gray-800 mb-2">Xác nhận mật khẩu mới</Text>
            <TextInput
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={t => { setConfirmPassword(t); setConfirmPasswordError(''); }}
              className={`bg-gray-200 rounded-2xl px-4 py-3 text-gray-800 ${confirmPasswordError ? 'border border-red-400' : 'mb-6'}`}
              editable={!isLoading}
            />
            <InlineError message={confirmPasswordError} />

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={isLoading}
              className={`rounded-2xl py-4 mt-2 ${isLoading ? 'bg-gray-400' : 'bg-[#226B5D]'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Đổi mật khẩu
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
