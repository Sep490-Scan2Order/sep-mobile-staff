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
            Chọn thời gian xác nhận nhận hàng cho đơn pre-order
          </Text>
          <View
            style={{
              flexDirection: 'row',
              height: PICKER_HEIGHT,
              marginBottom: 20,
            }}
          >
            {}
            <View style={{ flex: 1 }}>
              <Text className="text-center text-xs text-gray-400 mb-1 font-semibold">
                Giờ
              </Text>
              <FlatList
                ref={hourListRef}
                data={HOURS}
                keyExtractor={i => String(i)}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                snapToAlignment="center"
                decelerationRate="fast"
                onMomentumScrollEnd={onHourScroll}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                }}
                renderItem={({ item }) => {
                  const isActive = selectedHour === item;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedHour(item);
                        scrollToHour(item);
                      }}
                      style={{
                        height: ITEM_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isActive ? '#E8F3F0' : 'transparent',
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isActive ? 24 : 14,
                          fontWeight: isActive ? '700' : '400',
                          color: isActive ? '#226B5D' : '#9CA3AF',
                          opacity: isActive ? 1 : 0.5,
                        }}
                      >
                        {String(item).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
            {}
            <View className="w-6 justify-center items-center">
              <Text className="text-xl font-bold text-[#226B5D] mt-4">:</Text>
            </View>
            {}
            <View style={{ flex: 1 }}>
              <Text className="text-center text-xs text-gray-400 mb-1 font-semibold">
                Phút
              </Text>
              <FlatList
                ref={minuteListRef}
                data={MINUTES}
                keyExtractor={i => String(i)}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                snapToAlignment="center"
                decelerationRate="fast"
                onMomentumScrollEnd={onMinuteScroll}
                getItemLayout={(_, index) => ({
                  length: ITEM_HEIGHT,
                  offset: ITEM_HEIGHT * index,
                  index,
                })}
                contentContainerStyle={{
                  paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
                }}
                renderItem={({ item }) => {
                  const isActive = selectedMinute === item;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedMinute(item);
                        scrollToMinute(MINUTES.indexOf(item));
                      }}
                      style={{
                        height: ITEM_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isActive ? '#E8F3F0' : 'transparent',
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isActive ? 24 : 14,
                          fontWeight: isActive ? '700' : '400',
                          color: isActive ? '#226B5D' : '#9CA3AF',
                          opacity: isActive ? 1 : 0.5,
                        }}
                      >
                        {String(item).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
          {}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl border border-gray-300 items-center"
              onPress={onClose}
              disabled={confirming}
            >
              <Text className="text-gray-600 font-semibold">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl bg-[#226B5D] items-center"
              onPress={onConfirm}
              disabled={confirming}
            >
              {confirming ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Xác nhận</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
