import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface Props {
  title: string;
  onPress?: () => void;
}

export const PrimaryButton: React.FC<Props> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-[#226B5D] mx-6 py-4 rounded-2xl items-center"
    >
      <Text className="text-white font-semibold text-base">{title}</Text>
    </TouchableOpacity>
  );
};
