import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TabBar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const tabs = ['Tất cả', 'Đang bán', 'Ngừng bán'];

  return (
    <View
      className="flex-row bg-gray-200 rounded-xl mx-6 p-1"
      style={{ marginTop: 68 }}
    >
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          className={`flex-1 py-2 rounded-lg items-center ${
            activeTab === tab ? 'bg-white' : ''
          }`}
        >
          <Text
            className={`text-sm ${
              activeTab === tab
                ? 'text-emerald-700 font-semibold'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
