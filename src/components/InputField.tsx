import React from 'react';
import { View, Text, TextInput, KeyboardTypeOptions } from 'react-native';

interface Props {
  label: string;
  multiline?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  numberOfLines?: number;
}

export const InputField: React.FC<Props> = ({
  label,
  multiline,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  numberOfLines,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-700 mb-2">{label}</Text>

      <TextInput
        multiline={multiline}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        numberOfLines={numberOfLines}
        placeholderTextColor="#9ca3af"
        className={`border border-[#226B5D70] rounded-lg px-3 ${
          multiline ? 'h-24 pt-3 text-start' : 'h-12'
        }`}
        style={{ textAlignVertical: multiline ? 'top' : 'center' }}
      />
    </View>
  );
};
