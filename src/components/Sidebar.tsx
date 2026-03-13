import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import {
  LayoutDashboard,
  CookingPot,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  status?: number;
}

interface SidebarProps {
  activeIndex?: number;
  onItemPress?: (index: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeIndex = -1,
  onItemPress,
}) => {
  const { unread } = useSelector((state: RootState) => state.order);

  const navItems: NavItem[] = [
    {
      icon: <CookingPot size={22} color="#226B5D" />,
      label: 'Đang làm',
      status: 1,
    },
    {
      icon: <ClipboardCheck size={22} color="#226B5D" />,
      label: 'Đã xong',
      status: 2,
    },
    {
      icon: <CheckCircle2 size={22} color="#226B5D" />,
      label: 'Đã giao',
      status: 3,
    },
  ];

  const Badge = ({ count }: { count: number }) => {
    if (!count) return null;

    return (
      <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
        <Text className="text-white text-xs font-bold">{count}</Text>
      </View>
    );
  };

  return (
    <View className="w-24 flex-col gap-5 p-2">
      {/* ALL */}
      <TouchableOpacity
        onPress={() => onItemPress?.(-1)}
        className={`border rounded-lg py-4 items-center justify-center shadow-sm relative ${
          activeIndex === -1 ? 'bg-gray-100' : 'bg-white'
        }`}
      >
        <LayoutDashboard size={22} color="#226B5D" />
        <Badge count={unread.all} />
        <Text className="font-bold text-base">Tất cả</Text>
      </TouchableOpacity>

      <View className="bg-white border h-full border-[#226B5DCC] rounded-lg py-2 shadow-sm">
        {navItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onItemPress?.(item.status!)}
            className={`items-center py-4 relative ${
              activeIndex === item.status ? 'bg-gray-100' : ''
            }`}
          >
            {item.icon}

            <Badge count={unread[item.status as 1 | 2 | 3]} />

            <Text className="text-xs mt-1 text-gray-700 text-center">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
