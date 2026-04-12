import { useState, useCallback } from 'react';
import { SnackbarConfig } from '@/components/AppSnackbar';

export const useSnackbar = () => {
  const [config, setConfig] = useState<SnackbarConfig & { visible: boolean }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const show = useCallback((params: SnackbarConfig) => {
    // Reset rồi show lại để trigger animation kể cả khi đang hiện
    setConfig({ ...params, visible: false });
    setTimeout(() => setConfig({ ...params, visible: true }), 50);
  }, []);

  const hide = useCallback(() => {
    setConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const showSuccess = useCallback((message: string, duration = 3000) => {
    show({ message, type: 'success', duration });
  }, [show]);

  const showError = useCallback((message: string, duration = 4000) => {
    show({ message, type: 'error', duration });
  }, [show]);

  const showWarning = useCallback((message: string, duration = 3500) => {
    show({ message, type: 'warning', duration });
  }, [show]);

  const showInfo = useCallback((message: string, duration = 3000) => {
    show({ message, type: 'info', duration });
  }, [show]);

  return { config, show, hide, showSuccess, showError, showWarning, showInfo };
};
