import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
interface InlineErrorProps {
  message?: string;
  visible?: boolean;
}
export const InlineError: React.FC<InlineErrorProps> = ({ message, visible = true }) => {
  if (!message || !visible) return null;
  return (
    <View style={styles.container}>
      <AlertCircle size={13} color="#DC2626" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  text: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});
