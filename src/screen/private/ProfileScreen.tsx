import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { User, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
export default function ProfileScreen() {
  const navigation = useNavigation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  if (!userInfo) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Chưa đăng nhập123</Text>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-white">
      <View className="bg-teal-700 pt-16 pb-8 items-center rounded-b-3xl relative">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute left-6 top-16 z-10"
        >
          <ArrowLeft size={28} color="white" />
        </TouchableOpacity>
        {userInfo.avatar ? (
          <Image
            source={{ uri: userInfo.avatar }}
            className="w-24 h-24 rounded-full border-4 border-white"
          />
        ) : (
          <View className="w-24 h-24 rounded-full border-4 border-white bg-teal-600 items-center justify-center">
            <User size={48} color="white" />
          </View>
        )}
        <Text className="text-white text-lg font-semibold mt-3">
          {userInfo.name}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 gap-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">Họ và tên</Text>
            <Text className="font-semibold text-base">{userInfo.name}</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">Email</Text>
            <Text className="font-semibold text-base">{userInfo.email}</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">Chức vụ</Text>
            <Text className="font-semibold text-base">{userInfo.role}</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">Nhà hàng</Text>
            <Text className="font-semibold text-base">{userInfo.restaurantName}</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">Số điện thoại</Text>
            <Text className="font-semibold text-base">{userInfo.phone || 'Chưa cập nhật'}</Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">Ngày tham gia</Text>
            <Text className="font-semibold text-base">
              {new Date(userInfo.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-500 text-sm">Trạng thái</Text>
            <Text
              className={`font-semibold text-base ${
                userInfo.isActive ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {userInfo.isActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
