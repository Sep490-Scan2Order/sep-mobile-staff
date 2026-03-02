import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import { HeaderDetail } from '../../components/HeaderDetail';
import { CustomerDetailBorder } from '../../components/CustomerDetailBorder';
import { ListFood } from '../../components/ListFood';
import { Border } from '../../components/Border';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  DetailOrderScreen: { order: Order };
  DetailPaymentScreen: { order: Order };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DetailOrderScreen'
>;

type DetailRouteProp = RouteProp<RootStackParamList, 'DetailOrderScreen'>;
export default function DetailOrderScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { order } = route.params;
  return (
    <View className="flex-1 bg-gray-100">
      <HeaderDetail />

      <ScrollView className="px-7 -mt-80">
        <CustomerDetailBorder order={order} />

        <Border>
          <FlatList
            data={order.items}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => <ListFood item={item} />}
          />
        </Border>
      </ScrollView>

      <View className="px-4 pb-6 bg-gray-100">
        <TouchableOpacity
          onPress={() => navigation.navigate('DetailPaymentScreen', { order })}
          className="bg-[#226B5D] py-4 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-white text-lg font-semibold">Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
