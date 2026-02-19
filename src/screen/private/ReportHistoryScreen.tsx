import React from 'react';
import { View, ScrollView } from 'react-native';
import { HeaderDetail } from '../../components/HeaderDetail';
import { StatCard } from '../../components/StatCard';
import { HistoryCard } from '../../components/HistoryCard';

export const ReportHistoryScreen = () => {
  const reports = [
    {
      id: 1,
      employee: 'Nguyen Van A',
      restaurant: 'Nguyen Van A',
      totalOrder: 2,
      actualCash: 3,
      note: '3',
    },
  ];

  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail title="Quản lý báo cáo" heightClass="h-2/6" />
      {/* Stats */}
      <View className="flex-row px-5 " style={{ marginTop: -120 }}>
        <StatCard number={4} label="Tổng số" />
        <StatCard number={1} label="Khớp" />
        <StatCard number={2} label="Chênh lệch" />
      </View>

      {/* List */}
      <ScrollView className="mt-4 mb-24" style={{ marginTop: 90 }}>
        {reports.map(report => (
          <HistoryCard key={report.id} {...report} />
        ))}
      </ScrollView>
    </View>
  );
};
