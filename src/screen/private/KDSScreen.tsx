import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { SDKTable } from '../../components/KDSTable';
import { BottomNavbar } from '../../components/BottomNavbar';

const KDSScreen: React.FC = () => {
  const [activeSidebarIndex, setActiveSidebarIndex] = useState(0);
  const [activeBottomIndex, setActiveBottomIndex] = useState(0);

  return (
    <View className="flex-1 bg-teal-700">
      {/* Safe area chỉ cho content */}
      <SafeAreaView className="flex-1" edges={['top']}>
        <Header />

        <View className="flex-1 flex-row bg-white">
          <Sidebar
            activeIndex={activeSidebarIndex}
            onItemPress={setActiveSidebarIndex}
          />

          <View className="flex-1">
            <SDKTable />
          </View>
        </View>
      </SafeAreaView>

      {/* BottomNavbar nằm ngoài */}
      <BottomNavbar
        activeIndex={activeBottomIndex}
        onItemPress={setActiveBottomIndex}
      />
    </View>
  );
};

export default KDSScreen;
