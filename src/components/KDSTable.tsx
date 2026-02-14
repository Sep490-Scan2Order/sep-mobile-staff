import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, DollarSign, Phone, MoreVertical } from 'lucide-react-native';

interface Order {
  id: string;
  phone: string;
  orderCode: string;
  date: string;
  time: string;
  amount: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    phone: '0909123456',
    orderCode: 'ORD-2026001',
    date: '13/02/2026',
    time: '14:30',
    amount: '450,000 VNĐ',
  },
  {
    id: '2',
    phone: '0988777666',
    orderCode: 'ORD-2026002',
    date: '13/02/2026',
    time: '16:10',
    amount: '780,000 VNĐ',
  },
  {
    id: '3',
    phone: '0911222333',
    orderCode: 'ORD-2026003',
    date: '12/02/2026',
    time: '09:45',
    amount: '1,200,000 VNĐ',
  },
];

export const SDKTable: React.FC = () => {
  return (
    <ScrollView className="flex-1 px-4 py-4">
      {mockOrders.map(item => (
        <View
          key={item.id}
          className="bg-gray-100 rounded-xl border-2 border-[#226B5D] overflow-hidden mb-6"
        >
          {/* Header - Phone */}
          <View className="flex-row items-center px-4 py-4 border-b border-dashed border-gray-400">
            <Phone size={20} color="#226B5D" />
            <Text className="flex-1 ml-3 text-base text-gray-700">
              {item.phone}
            </Text>
            <MoreVertical size={18} color="#226B5D" />
          </View>

          {/* Middle */}
          <View className="flex-row">
            {/* Left - Order code */}
            <View className="flex-1 justify-center px-3 py-4 border-r border-gray-300">
              <Text className="text-lg text-gray-700 font-semibold">
                {item.orderCode}
              </Text>
            </View>

            {/* Right */}
            <View className="flex-1">
              <View className="flex-row items-center px-3 py-3 border-b border-gray-300">
                <Calendar size={16} color="#777" />
                <Text className="ml-2 text-sm text-gray-600">
                  {item.date} - {item.time}
                </Text>
              </View>

              <View className="flex-row items-center px-3 py-3">
                <DollarSign size={16} color="#777" />
                <Text className="ml-2 text-sm text-gray-600">
                  {item.amount}
                </Text>
              </View>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity className="py-4 items-center border-t border-dashed border-gray-400">
            <Text className="text-[#226B5D] text-base font-semibold">
              Bắt đầu làm
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};
