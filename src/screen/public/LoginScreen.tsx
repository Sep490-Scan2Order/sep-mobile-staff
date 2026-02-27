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
import { Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../type/types';

// IMPORT LOGIC CỦA BẠN
import { authService } from '../../services/logicServices/authService';

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // HÀM XỬ LÝ ĐĂNG NHẬP
  const handleLogin = async () => {
    console.log('===== BẮT ĐẦU LOGIN =====');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    if (!email.trim() || !password.trim()) {
      console.log('Thiếu email hoặc password');
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setIsLoading(true);
    console.log('Đã set loading = true');

    try {
      console.log('Gọi authService.login...');

      const result = await authService.login({
        email: email.trim(),
        password: password,
      });

      console.log('Nhận được response từ service');
      console.log('Result full:', JSON.stringify(result, null, 2));

      if (result.success) {
        console.log('ĐĂNG NHẬP THÀNH CÔNG');
        console.log('User:', result.user);
      } else {
        console.log('Đăng nhập thất bại:', result.message);
        Alert.alert(
          'Đăng nhập thất bại',
          result.message || 'Sai tài khoản hoặc mật khẩu',
        );
      }
    } catch (error: any) {
      console.log('CATCH ERROR LOGIN:', error);
      console.log('Error message:', error?.message);
      console.log('Error response:', error?.response);

      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại Backend.',
      );
    } finally {
      console.log('FINALLY - set loading = false');
      setIsLoading(false);
    }

    console.log('===== KẾT THÚC LOGIN =====');
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
                  className="bg-gray-200 rounded-2xl px-4 py-3 mb-6 text-gray-800"
                  placeholder="Nhập email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />

                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  Mật khẩu
                </Text>
                <View className="mb-2 relative">
                  <TextInput
                    className="bg-gray-200 rounded-2xl px-4 py-3 pr-12 text-gray-800"
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
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

                <TouchableOpacity
                  className="mb-6"
                  onPress={() => navigation.navigate('EmailForOTPScreen')}
                  disabled={isLoading}
                >
                  <Text className="text-right text-gray-700 font-medium">
                    Reset mật khẩu ?
                  </Text>
                </TouchableOpacity>

                {/* NÚT ĐĂNG NHẬP ĐÃ GẮN LOGIC */}
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
    </SafeAreaView>
  );
}
