import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';
export type AppModalType = 'success' | 'error' | 'warning' | 'info';
export interface AppModalButton {
  label: string;
  onPress: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}
interface AppModalProps {
  visible: boolean;
  type?: AppModalType;
  title: string;
  message?: string;
  buttons?: AppModalButton[];
  onDismiss?: () => void;
}
const TYPE_CONFIG = {
  success: {
    icon: CheckCircle,
    iconColor: '#1A7A5E',
    bgColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  error: {
    icon: XCircle,
    iconColor: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  info: {
    icon: Info,
    iconColor: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
};
const BUTTON_STYLES: Record<string, object> = {
  primary: {
    backgroundColor: '#226B5D',
  },
  secondary: {
    backgroundColor: '#F3F4F6',
  },
  danger: {
    backgroundColor: '#DC2626',
  },
};
const BUTTON_TEXT_STYLES: Record<string, object> = {
  primary: { color: '#FFFFFF' },
  secondary: { color: '#374151' },
  danger: { color: '#FFFFFF' },
};
export const AppModal: React.FC<AppModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  buttons,
  onDismiss,
}) => {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = TYPE_CONFIG[type];
  const IconComponent = config.icon;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible]);
  const defaultButtons: AppModalButton[] = buttons ?? [
    {
      label: 'Đóng',
      onPress: onDismiss ?? (() => {}),
      style: 'primary',
    },
  ];
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[styles.card, { transform: [{ scale }], opacity }]}
        >
          {}
          <View style={[styles.iconWrapper, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
            <IconComponent size={40} color={config.iconColor} />
          </View>
          {}
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          {}
          <View style={[styles.btnRow, defaultButtons.length === 1 && styles.btnSingle]}>
            {defaultButtons.map((btn, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={btn.onPress}
                style={[
                  styles.btn,
                  defaultButtons.length > 1 && styles.btnFlex,
                  BUTTON_STYLES[btn.style ?? 'primary'],
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.btnText, BUTTON_TEXT_STYLES[btn.style ?? 'primary']]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    width: '100%',
  },
  btnSingle: {
    justifyContent: 'center',
  },
  btnFlex: {
    flex: 1,
  },
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 80,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
