import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import {
  LayoutDashboard,
  ClockFading,
  CookingPot,
  ClipboardCheck,
} from 'lucide-react-native';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

interface SidebarProps {
  activeIndex?: number;
  onItemPress?: (index: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeIndex = 0,
  onItemPress,
}) => {
  const navItems: NavItem[] = [
    {
      icon: <ClockFading />,
      label: 'Đang chờ ',
      badge: 1,
    },
    { icon: <CookingPot />, label: 'Đang làm' },
    { icon: <ClipboardCheck />, label: 'Đã xong' },
  ];

  return (
    <View className="w-24 flex-col gap-5 p-2">
      {/* Hàng 1 - Tất cả */}
      <TouchableOpacity
        onPress={() => onItemPress?.(-1)}
        className="bg-white  border border-[#226B5DCC] rounded-lg py-4 items-center justify-center shadow-sm"
      >
        <LayoutDashboard />
        <Text className="font-bold text-base">Tất cả</Text>
      </TouchableOpacity>

      {/* Hàng 2 - Danh sách item */}
      <View className="bg-white border h-full border-[#226B5DCC] rounded-lg py-2 shadow-sm">
        {navItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onItemPress?.(index)}
            className={`items-center py-4 relative ${
              activeIndex === index ? 'bg-gray-100' : ''
            }`}
          >
            <View className="relative">
              {item.icon}
              {item.badge && (
                <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {item.badge}
                  </Text>
                </View>
              )}
            </View>

            <Text className="text-xs mt-1 text-gray-700 text-center">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
