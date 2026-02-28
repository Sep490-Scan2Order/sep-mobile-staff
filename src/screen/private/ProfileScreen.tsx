import React from 'react';
import { View, Text, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function ProfileScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userInfo = user?.userInfo;

  if (!userInfo) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Chưa đăng nhập</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-emerald-700 pt-16 pb-8 items-center rounded-b-3xl">
        <Image
          source={{
            uri: userInfo.avatar ?? 'https://i.pravatar.cc/150?img=3',
          }}
          className="w-24 h-24 rounded-full border-4 border-white"
        />

        <Text className="text-white text-lg font-semibold mt-3">
          {userInfo.name}
        </Text>
      </View>

      <View className="p-4 gap-4 mt-4">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-gray-500">Account ID</Text>
          <Text className="font-semibold">{userInfo.accountId}</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-gray-500">Trạng thái</Text>
          <Text
            className={`font-semibold ${
              userInfo.isActive ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {userInfo.isActive ? 'Đang hoạt động' : 'Chưa kích hoạt'}
          </Text>
        </View>
      </View>
    </View>
  );
}
