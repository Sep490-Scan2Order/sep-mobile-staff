import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MoreVertical } from 'lucide-react-native';

interface NavbarProps {
  title?: string;
  onMenuPress?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'Số đinh hoài',
  onMenuPress,
}) => {
  return (
    <View className="bg-white px-4 py-3 border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center bg-blue-50 border-2 border-blue-500 rounded-lg px-3 py-2">
            <Text className="text-blue-600 mr-2">⚙️</Text>
            <Text className="flex-1 text-gray-700 font-medium">{title}</Text>
            <TouchableOpacity onPress={onMenuPress}>
              <MoreVertical size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
