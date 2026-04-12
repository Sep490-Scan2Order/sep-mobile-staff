import { useState, useCallback } from 'react';
import { AppModalButton, AppModalType } from '@/components/AppModal';

interface ModalConfig {
  visible: boolean;
  type: AppModalType;
  title: string;
  message?: string;
  buttons?: AppModalButton[];
}

export const useAppModal = () => {
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    visible: false,
    type: 'info',
    title: '',
  });

  const showModal = useCallback(
    (params: Omit<ModalConfig, 'visible'>) => {
      setModalConfig({ ...params, visible: true });
    },
    [],
  );

  const hideModal = useCallback(() => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, onOk?: () => void) => {
      showModal({
        type: 'success',
        title,
        message,
        buttons: [
          {
            label: 'OK',
            onPress: () => {
              hideModal();
              onOk?.();
            },
            style: 'primary',
          },
        ],
      });
    },
    [showModal, hideModal],
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showModal({
        type: 'error',
        title,
        message,
        buttons: [{ label: 'Đóng', onPress: hideModal, style: 'primary' }],
      });
    },
    [showModal, hideModal],
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showModal({
        type: 'warning',
        title,
        message,
        buttons: [{ label: 'Đóng', onPress: hideModal, style: 'primary' }],
      });
    },
    [showModal, hideModal],
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmLabel = 'Xác nhận',
      danger = false,
    ) => {
      showModal({
        type: 'warning',
        title,
        message,
        buttons: [
          { label: 'Hủy', onPress: hideModal, style: 'secondary' },
          {
            label: confirmLabel,
            onPress: () => {
              hideModal();
              onConfirm();
            },
            style: danger ? 'danger' : 'primary',
          },
        ],
      });
    },
    [showModal, hideModal],
  );

  return { modalConfig, showModal, hideModal, showSuccess, showError, showWarning, showConfirm };
};
