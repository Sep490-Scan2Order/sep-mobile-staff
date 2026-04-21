import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
const TABS = ['Tất cả', 'Đang bán', 'Đã bán hết'];
export const TabBar: React.FC<Props> = React.memo(({ activeTab, setActiveTab }) => {
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
            className="flex-1 py-2 rounded-lg items-center justify-center relative overflow-hidden"
          >
            {isActive && (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(400)}
                className="absolute w-full h-full bg-white rounded-lg"
              />
            )}
            <Text
              className={`text-sm z-10 ${
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
});
