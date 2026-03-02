import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, DollarSign, Phone, MoreVertical } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  phone: string;
  orderCode: string;
  createdAt: string;
  tableName: string;
  amount: number;
  items: OrderItem[];
}
const mockOrders: Order[] = [
  {
    id: '1',
    phone: '0909123456',
    orderCode: 'ORD-2026001',
    createdAt: '2026-02-13T14:30:00',
    tableName: 'Bàn 05',
    amount: 450000,
    items: [
      {
        id: '1',
        name: 'Combo 1 người',
        price: 100000,
        quantity: 2,
        image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
      },
      {
        id: '2',
        name: 'Nước ngọt',
        price: 25000,
        quantity: 2,
        image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
      },
    ],
  },
  {
    id: '2',
    phone: '0988777666',
    orderCode: 'ORD-2026002',
    createdAt: '2026-02-13T16:10:00',
    tableName: 'Bàn 02',
    amount: 780000,
    items: [
      {
        id: '3',
        name: 'Lẩu hải sản',
        price: 350000,
        quantity: 1,
        image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
      },
      {
        id: '4',
        name: 'Coca Cola',
        price: 20000,
        quantity: 3,
        image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
      },
    ],
  },
  {
    id: '3',
    phone: '0911222333',
    orderCode: 'ORD-2026003',
    createdAt: '2026-02-12T09:45:00',
    tableName: 'VIP 01',
    amount: 1200000,
    items: [
      {
        id: '5',
        name: 'Set BBQ',
        price: 600000,
        quantity: 2,
        image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
      },
    ],
  },
];
type RootStackParamList = {
  DetailOrderScreen: { order: Order };
};
export const SDKTable: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
          <TouchableOpacity
            className="py-4 items-center border-t border-dashed border-gray-400"
            onPress={() =>
              navigation.navigate('DetailOrderScreen', { order: item })
            }
          >
            <Text className="text-[#226B5D] text-base font-semibold">
              Bắt đầu làm
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};
