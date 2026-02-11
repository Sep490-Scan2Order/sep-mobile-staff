// src/screens/auth/EmailForOTPScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Mail } from 'lucide-react-native';

export default function EmailForOTPScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  return (
    <View className="flex-1 bg-[#226B5D] px-6 justify-center">
      {/* Back button */}
      <TouchableOpacity
        className="absolute top-12 left-5 p-2"
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={28} color="white" />
      </TouchableOpacity>

      {/* CONTENT */}
      <View className="items-center">
        {/* Icon */}
        <View className="mb-8">
          <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center">
            <Mail size={28} color="white" />
          </View>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-white mb-3 text-center">
          Nhập email để nhận OTP
        </Text>

        {/* Subtitle */}
        <Text className="text-base text-white/80 text-center mb-10 leading-6">
          Chúng tôi sẽ gửi mã xác thực OTP đến email bạn đã đăng ký trong hệ
          thống
        </Text>

        {/* Email input */}
        <View className="w-full mb-8">
          <TextInput
            className="w-full h-14 rounded-2xl bg-white px-4 text-base text-gray-800"
            placeholder="Nhập email của bạn"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Button */}
        <TouchableOpacity className="w-full bg-white rounded-2xl py-4">
          <Text className="text-center text-[#226B5D] font-bold text-lg">
            Gửi mã OTP
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
