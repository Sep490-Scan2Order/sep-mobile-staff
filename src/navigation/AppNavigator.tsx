// // src/navigation/RootNavigator.tsx
// import React from 'react';
// import { View, Text, ActivityIndicator } from 'react-native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';


// export type RootStackParamList = {
//   Auth: undefined;
//   Bim: undefined;
//   Main: undefined;
//   Home: undefined;
//   SubscriptionScreen: undefined;
//   DailyOverviewTabs: any;
//   Loading: any;
//   Checkout: { checkoutUrl: string };
//   AddFood: { logId: number; mealType: string };
//   FoodDetail: { food: any; logId: number; mealType: string };
//   CancelPage: { order: any };
//   SuccessPage: { order: any };
//   FoodScanner: { photoUri: string };
//   ActivitySearch: undefined;
//   FoodResult: { result: any };
//   Chatbox: undefined;
// };

// const Stack = createNativeStackNavigator<RootStackParamList>();


// export default function RootNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {/* Define your screens here */}
     
//     </Stack.Navigator>
//   );
// }