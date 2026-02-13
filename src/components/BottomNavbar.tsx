import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ClipboardList, Headphones } from 'lucide-react-native';

interface BottomNavbarProps {
  activeIndex?: number;
  onItemPress?: (index: number) => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  activeIndex = 0,
  onItemPress,
}) => {
  const items = [
    { icon: <ClipboardList size={24} color="#666" />, label: 'Calendar' },
  ];

  return (
    <View className="flex-row bg-white border-t border-gray-200 h-16">
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onItemPress?.(index)}
          className={`flex-1 items-center justify-center ${
            activeIndex === index ? 'bg-gray-100' : ''
          }`}
        >
          {item.icon}
        </TouchableOpacity>
      ))}
    </View>
  );
};
