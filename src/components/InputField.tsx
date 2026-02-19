import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface Props {
  label: string;
  multiline?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const InputField: React.FC<Props> = ({
  label,
  multiline,
  value,
  onChangeText,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-700 mb-2">{label}</Text>

      <TextInput
        multiline={multiline}
        value={value}
        onChangeText={onChangeText}
        className={`border border-[#226B5D70] rounded-lg px-3 ${
          multiline ? 'h-24 pt-3' : 'h-12'
        }`}
      />
    </View>
  );
};
