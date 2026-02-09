import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-[#226B5D] justify-center">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 ">
            <View className="flex-1 justify-center">
              {/* HEADER */}
              <View className="items-center mb-20">
                <Text className="text-5xl font-bold text-white">Đăng nhập</Text>
              </View>

              {/* FORM */}
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
                  keyboardType="email-address"
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

                <TouchableOpacity className="mb-6">
                  <Text className="text-right text-gray-700 font-medium">
                    Quên mật khẩu ?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="bg-[#226B5D] rounded-2xl py-3 mb-4">
                  <Text className="text-white text-center font-bold text-lg">
                    Đăng nhập
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="bg-gray-300 rounded-2xl py-3">
                  <Text className="text-gray-800 text-center font-bold text-lg">
                    Đăng ký
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
