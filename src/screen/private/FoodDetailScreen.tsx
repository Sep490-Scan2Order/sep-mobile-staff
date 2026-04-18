import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/type';
import { ChevronLeft } from 'lucide-react-native';

type FoodDetailRouteProp = RouteProp<RootStackParamList, 'FoodDetailScreen'>;

const { width } = Dimensions.get('window');

export default function FoodDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute<FoodDetailRouteProp>();
  const {
    name,
    price,
    image,
    active,
    originalPrice,
    discountedPrice,
    promotionName,
    hasPromotion,
    stockQuantity,
    isCombo,
    comboItems,
    description,
  } = params;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ZONE A — Z-PATTERN HERO
            Eye path: [←Back]  ↗  [COMBO]
                         ↘
                    [● Status]  →  [Kho]
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <View style={{ width, height: width * 0.85 }}>
          {/* Hero image — full bleed */}
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* Scrim — bottom fade only */}
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
            backgroundColor: 'transparent',
          }}>
            {/* simple dark-to-transparent gradient via layered views */}
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} />
          </View>

          {/* Z — top-left: Back */}
          <SafeAreaView style={{ position: 'absolute', top: 0, left: 0 }} edges={['top']}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                margin: 16,
                width: 40, height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.35)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronLeft size={22} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Z — top-right: COMBO badge */}
          {isCombo && (
            <SafeAreaView style={{ position: 'absolute', top: 0, right: 0 }} edges={['top']}>
              <View style={{
                margin: 16,
                backgroundColor: '#1d4ed8',
                borderRadius: 6,
                paddingHorizontal: 10, paddingVertical: 4,
              }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }}>
                  COMBO
                </Text>
              </View>
            </SafeAreaView>
          )}

          {/* Z — bottom-left: Status */}
          <View style={{
            position: 'absolute', bottom: 20, left: 20,
            flexDirection: 'row', alignItems: 'center', gap: 8,
          }}>
            <View style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: active ? '#4ade80' : '#f87171',
            }} />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
              {active ? 'Đang bán' : 'Hết hàng'}
            </Text>
          </View>

          {/* Z — bottom-right: Stock */}
          <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500' }}>
              Kho còn
            </Text>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'right' }}>
              {stockQuantity ?? 0}
            </Text>
          </View>
        </View>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ZONE B — T-PATTERN CONTENT
            ┌──────────────────────────────────────────┐  ← top bar: name (full width)
            │            [Tên món ăn]                  │
            └──────────┬───────────────────────────────┘
                       │  ← vertical stem
                    [Giá]
                    [── divider ──]
                    [Mô tả]
                    [Combo list]
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>

          {/* T — Top bar: name full-width */}
          <Text style={{
            fontSize: 24, fontWeight: '800',
            color: '#111827', lineHeight: 32,
            letterSpacing: -0.5,
          }}>
            {name}
          </Text>

          {/* T — Stem: price */}
          <View style={{ marginTop: 10, marginBottom: 20 }}>
            {hasPromotion && discountedPrice ? (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                <Text style={{ fontSize: 26, fontWeight: '800', color: '#dc2626' }}>
                  {discountedPrice.toLocaleString()} đ
                </Text>
                {originalPrice && (
                  <Text style={{
                    fontSize: 14, color: '#9ca3af',
                    textDecorationLine: 'line-through',
                  }}>
                    {originalPrice.toLocaleString()} đ
                  </Text>
                )}
              </View>
            ) : (
              <Text style={{ fontSize: 26, fontWeight: '800', color: '#134e4a' }}>
                {price}
              </Text>
            )}
            {promotionName && (
              <Text style={{ fontSize: 12, color: '#f97316', marginTop: 4, fontWeight: '500' }}>
                🏷 {promotionName}
              </Text>
            )}
          </View>

          {/* T — Divider */}
          <View style={{ height: 1, backgroundColor: '#f3f4f6', marginBottom: 20 }} />

          {/* T — Stem: description */}
          {description ? (
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 11, fontWeight: '700', color: '#9ca3af',
                letterSpacing: 1.5, marginBottom: 8,
              }}>
                MÔ TẢ
              </Text>
              <Text style={{
                fontSize: 14, color: '#6b7280',
                lineHeight: 22, letterSpacing: 0.1,
              }}>
                {description}
              </Text>
            </View>
          ) : null}

          {/* T — Stem: combo */}
          {isCombo && comboItems && comboItems.length > 0 && (
            <View>
              <Text style={{
                fontSize: 11, fontWeight: '700', color: '#9ca3af',
                letterSpacing: 1.5, marginBottom: 12,
              }}>
                THÀNH PHẦN COMBO
              </Text>

              {comboItems.map((ci, idx) => (
                <View key={idx}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                  }}>
                    {/* Item image */}
                    {ci.imageUrl ? (
                      <Image
                        source={{ uri: ci.imageUrl }}
                        style={{ width: 48, height: 48, borderRadius: 8 }}
                      />
                    ) : (
                      <View style={{
                        width: 48, height: 48, borderRadius: 8,
                        backgroundColor: '#f3f4f6',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: 22 }}>🍽</Text>
                      </View>
                    )}

                    {/* Item name */}
                    <Text style={{
                      flex: 1, marginLeft: 14,
                      fontSize: 14, color: '#1f2937', fontWeight: '500',
                    }}>
                      {ci.dishName}
                    </Text>

                    {/* Qty */}
                    <Text style={{
                      fontSize: 14, color: '#6b7280', fontWeight: '600',
                      minWidth: 32, textAlign: 'right',
                    }}>
                      ×{ci.quantity}
                    </Text>
                  </View>

                  {/* Row divider — skip last */}
                  {idx < comboItems.length - 1 && (
                    <View style={{ height: 1, backgroundColor: '#f9fafb' }} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
