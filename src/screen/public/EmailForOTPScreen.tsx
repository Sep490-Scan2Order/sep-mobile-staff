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
import { useNavigation } from '@react-navigation/native';
import { authService } from '@/services/logicServices/authService';
import { ChevronLeft } from 'lucide-react-native';

export default function EmailForOTPScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.sendForgotPasswordOtp(email.trim());
      if (result.success) {
        Alert.alert('Thành công', result.message, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ResetPasswordScreen', { email: email.trim() }),
          },
        ]);
      } else {
        Alert.alert('Lỗi', result.message);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kết nối server');
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
          <View className="mt-10 mb-20 items-center">
            <Text className="text-4xl font-bold text-white text-center">
              Quên mật khẩu
            </Text>
            <Text className="text-white mt-4 text-center">
              Nhập email để nhận mã OTP khôi phục mật khẩu
            </Text>
          </View>

          <View className="bg-white rounded-3xl p-6 shadow-lg">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Email của bạn
            </Text>
            <TextInput
              className="bg-gray-200 rounded-2xl px-4 py-3 mb-6 text-gray-800"
              placeholder="example@gmail.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />

            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isLoading}
              className={`rounded-2xl py-4 ${
                isLoading ? 'bg-gray-400' : 'bg-[#226B5D]'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Gửi mã OTP
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
