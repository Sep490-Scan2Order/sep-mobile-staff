import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '@/services/logicServices/authService';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const route = useRoute<any>();
  const { email } = route.params;
  const navigation = useNavigation();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu cũ');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.changePassword({
        email,
        oldPassword,
        newPassword,
      });

      if (result.success) {
        Alert.alert('Thành công', 'Mật khẩu đã được đổi thành công', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể đổi mật khẩu');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu');
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
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Email
            </Text>
            <TextInput
              value={email}
              editable={false}
              className="bg-gray-100 rounded-2xl px-4 py-3 mb-4 text-gray-500"
            />

            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Mật khẩu cũ
            </Text>
            <TextInput
              placeholder="Nhập mật khẩu cũ"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              className="bg-gray-200 rounded-2xl px-4 py-3 mb-4 text-gray-800"
              editable={!isLoading}
            />

            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Mật khẩu mới
            </Text>
            <View className="relative mb-4">
              <TextInput
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                className="bg-gray-200 rounded-2xl px-4 py-3 pr-12 text-gray-800"
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
              Xác nhận mật khẩu mới
            </Text>
            <TextInput
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="bg-gray-200 rounded-2xl px-4 py-3 mb-6 text-gray-800"
              editable={!isLoading}
            />

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={isLoading}
              className={`rounded-2xl py-4 ${
                isLoading ? 'bg-gray-400' : 'bg-[#226B5D]'
              }`}
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
    </SafeAreaView>
  );
}
