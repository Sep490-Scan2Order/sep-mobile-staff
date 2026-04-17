import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react-native';
export type SnackbarType = 'success' | 'error' | 'warning' | 'info';
export interface SnackbarConfig {
  message: string;
  type?: SnackbarType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}
interface AppSnackbarProps extends SnackbarConfig {
  visible: boolean;
  onDismiss: () => void;
}
const CONFIG = {
  success: {
    bg: '#1A7A5E',
    icon: CheckCircle,
    iconColor: '#6EE7B7',
    textColor: '#ECFDF5',
  },
  error: {
    bg: '#B91C1C',
    icon: XCircle,
    iconColor: '#FCA5A5',
    textColor: '#FEF2F2',
  },
  warning: {
    bg: '#92400E',
    icon: AlertTriangle,
    iconColor: '#FCD34D',
    textColor: '#FFFBEB',
  },
  info: {
    bg: '#1E40AF',
    icon: Info,
    iconColor: '#93C5FD',
    textColor: '#EFF6FF',
  },
};
export const AppSnackbar: React.FC<AppSnackbarProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  actionLabel,
  onAction,
  onDismiss,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const config = CONFIG[type];
  const IconComponent = config.icon;
  useEffect(() => {
    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      timerRef.current = setTimeout(() => {
        hide();
      }, duration);
    } else {
      hide();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);
  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };
  if (!visible) return null;
  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bg, transform: [{ translateY }], opacity },
      ]}
    >
      <IconComponent size={20} color={config.iconColor} />
      <Text style={[styles.message, { color: config.textColor }]} numberOfLines={2}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={() => { onAction(); hide(); }}>
          <Text style={[styles.actionLabel, { color: config.iconColor }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={hide} style={styles.closeBtn}>
        <X size={16} color={config.iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  closeBtn: {
    padding: 2,
  },
});
