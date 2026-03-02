import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = ['Tất cả', 'Đang bán', 'Đã bán hết'];

export const TabBar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  return (
    <View
      className="flex-row bg-gray-200 rounded-xl mx-6 p-1"
      style={{ marginTop: 68 }}
    >
      {TABS.map(tab => {
        const isActive = activeTab === tab;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg items-center ${
              isActive ? 'bg-white' : ''
            }`}
          >
            <Text
              className={`text-sm ${
                isActive ? 'text-emerald-700 font-semibold' : 'text-gray-500'
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
