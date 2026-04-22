import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
  selectedHour: number;
  selectedMinute: number;
  setSelectedHour: (h: number) => void;
  setSelectedMinute: (m: number) => void;
}

export const TimePickerModal: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  confirming,
  selectedHour,
  selectedMinute,
  setSelectedHour,
  setSelectedMinute,
}) => {
  const ITEM_HEIGHT = 48;
  const VISIBLE_ITEMS = 5;
  const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);

  const scrollToHour = (h: number) => {
    hourListRef.current?.scrollToOffset({
      offset: h * ITEM_HEIGHT,
      animated: true,
    });
  };

  const scrollToMinute = (idx: number) => {
    minuteListRef.current?.scrollToOffset({
      offset: idx * ITEM_HEIGHT,
      animated: true,
    });
  };

  useEffect(() => {
    if (visible) {
      const minuteIdx = MINUTES.indexOf(selectedMinute);
      setTimeout(() => {
        scrollToHour(selectedHour);
        scrollToMinute(minuteIdx === -1 ? 0 : minuteIdx);
      }, 50);
    }
  }, [visible]);

  const onHourScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, HOURS.length - 1));
    setSelectedHour(HOURS[clamped]);
  };

  const onMinuteScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, MINUTES.length - 1));
    setSelectedMinute(MINUTES[clamped]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-lg font-bold text-gray-800 mb-1">
            Chọn giờ nhận hàng
          </Text>
          <Text className="text-sm text-gray-500 mb-5">
            Cuộn để chọn thời gian xác nhận nhận hàng
          </Text>

          {/* Labels Row */}
          <View className="flex-row mb-2">
            <View className="flex-1">
              <Text className="text-center text-xs text-gray-400 font-semibold">Giờ</Text>
            </View>
            <View className="w-6" /> {/* Spacer for separator */}
            <View className="flex-1">
              <Text className="text-center text-xs text-gray-400 font-semibold">Phút</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              height: PICKER_HEIGHT,
              marginBottom: 20,
              position: 'relative',
            }}
          >
            {/* Stationary Selection Indicator */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: ITEM_HEIGHT * 2,
                left: 0,
                right: 0,
                height: ITEM_HEIGHT,
                backgroundColor: '#E8F3F0',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(34, 107, 93, 0.1)',
                zIndex: 0,
              }}
            />

            {/* Hour Picker */}
            <View style={{ flex: 1 }}>
              <FlatList
                ref={hourListRef}
                data={HOURS}
                keyExtractor={i => `h-${i}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                snapToAlignment="start"
                scrollEventThrottle={16}
                decelerationRate="fast"
                onMomentumScrollEnd={onHourScroll}
                onScroll={onHourScroll}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * 2,
                }}
                renderItem={({ item }) => {
                  const isActive = selectedHour === item;
                  return (
                    <View
                      style={{
                        height: ITEM_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isActive ? 26 : 18,
                          fontWeight: isActive ? '900' : '500',
                          color: isActive ? '#226B5D' : '#D1D5DB',
                        }}
                      >
                        {String(item).padStart(2, '0')}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>

            {/* Separator */}
            <View className="w-6 justify-center items-center">
              <Text className="text-2xl font-bold text-[#226B5D] mb-1">:</Text>
            </View>

            {/* Minute Picker */}
            <View style={{ flex: 1 }}>
              <FlatList
                ref={minuteListRef}
                data={MINUTES}
                keyExtractor={i => `m-${i}`}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                snapToAlignment="start"
                scrollEventThrottle={16}
                decelerationRate="fast"
                onMomentumScrollEnd={onMinuteScroll}
                onScroll={onMinuteScroll}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * 2,
                }}
                renderItem={({ item }) => {
                  const isActive = selectedMinute === item;
                  return (
                    <View
                      style={{
                        height: ITEM_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isActive ? 26 : 18,
                          fontWeight: isActive ? '900' : '500',
                          color: isActive ? '#226B5D' : '#D1D5DB',
                        }}
                      >
                        {String(item).padStart(2, '0')}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-4 rounded-2xl border border-gray-200 items-center"
              onPress={onClose}
              disabled={confirming}
            >
              <Text className="text-gray-500 font-bold">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-4 rounded-2xl bg-[#226B5D] items-center shadow-sm"
              onPress={onConfirm}
              disabled={confirming}
            >
              {confirming ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Xác nhận</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
