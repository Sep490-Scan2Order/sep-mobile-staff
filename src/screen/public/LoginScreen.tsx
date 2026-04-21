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
import { Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/type';
import { authService } from '@/services/logicServices/authService';
import { InlineError } from '@/components/InlineError';
import { AppSnackbar } from '@/components/AppSnackbar';
import { useSnackbar } from '@/hooks/useSnackbar';
export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const snackbar = useSnackbar();
  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      valid = false;
    }
    return valid;
  };
  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const result = await authService.login({
        email: email.trim(),
        password: password,
      });
      if (result.success) {
      } else {
        snackbar.showError(result.message || 'Sai tài khoản hoặc mật khẩu');
      }
    } catch (error: any) {
      snackbar.showError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#226B5D] justify-center">
      <KeyboardAvoidingView behavior={'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 ">
            <View className="flex-1 justify-center">
              <View className="items-center mb-20">
                <Text className="text-5xl font-bold text-white">Đăng nhập</Text>
              </View>
              <View className="bg-white rounded-3xl p-6 shadow-lg">
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  Tên đăng nhập
                </Text>
                <TextInput
                  className={`bg-gray-200 rounded-2xl px-4 py-3 text-gray-800 ${emailError ? 'border border-red-400' : 'mb-2'}`}
                  placeholder="Nhập email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={t => { setEmail(t); setEmailError(''); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
                <InlineError message={emailError} />
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  Mật khẩu
                </Text>
                <View className={`relative ${passwordError ? '' : 'mb-2'}`}>
                  <TextInput
                    className={`bg-gray-200 rounded-2xl px-4 py-3 pr-12 text-gray-800 ${passwordError ? 'border border-red-400' : ''}`}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={t => { setPassword(t); setPasswordError(''); }}
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
                <InlineError message={passwordError} />
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('EmailForOTPScreen' as any)
                  }
                  className="mb-6 px-1"
                >
                  <Text className="text-[#226B5D] text-right font-semibold">
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  className={`rounded-2xl py-4 mb-4 ${
                    isLoading ? 'bg-gray-400' : 'bg-[#226B5D]'
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-bold text-lg">
                      Đăng nhập
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppSnackbar
        {...snackbar.config}
        onDismiss={snackbar.hide}
      />
    </SafeAreaView>
  );
}
