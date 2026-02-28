import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { User, LogOut, ChevronRight } from 'lucide-react-native';

import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  MenuMain: undefined;
  ProfileScreen: undefined;
};

const MenuItem = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl p-4 flex-row items-center justify-between mb-4 shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        <View className="bg-emerald-100 p-2 rounded-xl">
          <Icon size={22} color="#065f46" />
        </View>

        <View>
          <Text className="text-base font-semibold text-gray-800">{title}</Text>
          {subtitle && (
            <Text className="text-sm text-gray-500">{subtitle}</Text>
          )}
        </View>
      </View>

      <ChevronRight size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
};

export default function MenuScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const user = useSelector((state: RootState) => state.auth.user);
  const userInfo = user?.userInfo;

  if (!userInfo) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Chưa đăng nhập</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-emerald-700 pt-16 pb-8 items-center rounded-b-3xl">
        <Image
          source={{
            uri: userInfo.avatar ?? '',
          }}
          className="w-24 h-24 rounded-full border-4 border-white"
        />

        <Text className="text-white text-lg font-semibold mt-3">
          {userInfo.name}
        </Text>

        <Text className="text-emerald-100 text-sm">
          ID: {userInfo.accountId}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <MenuItem
          icon={User}
          title="Thông tin cá nhân"
          subtitle="Avatar, tên, gmail..."
          onPress={() => navigation.navigate('ProfileScreen')}
        />

        {/* Logout */}
        <TouchableOpacity
          onPress={() => dispatch(logout())}
          className="bg-red-500 rounded-2xl p-4 flex-row items-center justify-center gap-2 mt-6"
        >
          <LogOut size={20} color="white" />
          <Text className="text-white font-semibold">Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
