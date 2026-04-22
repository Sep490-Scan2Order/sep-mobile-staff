import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { User, LogOut, ChevronRight, Lock } from 'lucide-react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { authService } from '@/services/logicServices/authService';
import { RootStackParamList } from '@/type';
import { useAppModal } from '@/hooks/useAppModal';
import { AppModal } from '@/components/AppModal';
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
        <View className="bg-teal-100 p-2 rounded-xl">
          <Icon size={22} color="#0d9488" />
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
  const modal = useAppModal();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const currentShift = useSelector((state: RootState) => state.shift.currentShift);

  const handleLogout = () => {
    if (currentShift) {
      modal.showConfirm(
        'Cảnh báo Đăng xuất',
        'Bạn hiện đang trong ca làm việc. Bạn nên kết thúc ca (Check-out) trước khi đăng xuất để đảm bảo dữ liệu làm việc và đối soát chính xác. Bạn vẫn muốn đăng xuất chứ?',
        () => {
          dispatch(logout());
        },
        'Đăng xuất ngay'
      );
    } else {
      dispatch(logout());
    }
  };

  if (!userInfo) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Chưa đăng nhập</Text>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-white">
      {}
      <View className="bg-teal-700 pt-16 pb-8 items-center rounded-b-3xl">
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
        <Text className="text-teal-100 text-sm">
          {userInfo.role} • {userInfo.email}
        </Text>
      </View>
      {}
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
        <MenuItem
          icon={Lock}
          title="Đổi mật khẩu"
          subtitle="Cập nhật mật khẩu tài khoản"
          onPress={() => {
            navigation.navigate('ChangePasswordScreen', {
              email: userInfo.email,
            });
          }}
        />
        {}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 rounded-2xl p-4 flex-row items-center justify-center gap-2 mt-6"
        >
          <LogOut size={20} color="white" />
          <Text className="text-white font-semibold">Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
      <AppModal {...modal.modalConfig} onDismiss={modal.hideModal} />
    </View>
  );
}
