import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Order } from '@/type';
import { Receipt, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface PaymentDetailModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
  loading?: boolean;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  visible,
  order,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!order) return null;

  const subtotal = order.amount || 0;
  const discount = order.promotionDiscount || 0;
  const total = order.finalAmount || (subtotal - discount);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Receipt size={24} color="#226B5D" />
              <Text style={styles.title}>Thanh toán</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Mã đơn hàng:</Text>
              <Text style={styles.orderValue}>ORD-{order.orderCode}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.row}>
              <Text style={styles.label}>Tạm tính:</Text>
              <Text style={styles.value}>{subtotal.toLocaleString()} đ</Text>
            </View>

            {discount > 0 && (
              <View style={styles.row}>
                <Text style={styles.labelRed}>
                  {order.promotionName || 'Khuyến mãi'}:
                </Text>
                <Text style={styles.valueRed}>
                  - {discount.toLocaleString()} đ
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()} đ</Text>
            </View>

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                ⚠️ Vui lòng xác nhận bạn đã nhận đủ số tiền từ khách hàng trước khi bấm thanh toán.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelBtn}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(order.id)}
              style={styles.confirmBtn}
              disabled={loading}
            >
              <Text style={styles.confirmText}>
                {loading ? 'Đang xử lý...' : 'Thanh toán'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width * 0.95,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeBtn: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  orderLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 15,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#374151',
  },
  labelRed: {
    fontSize: 16,
    color: '#EF4444',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  valueRed: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#226B5D',
  },
  noteBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  noteText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#226B5D',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
