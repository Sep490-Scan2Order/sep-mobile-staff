import { renderHook, act } from '@testing-library/react-native';
import { useAppModal } from './useAppModal';
describe('useAppModal', () => {
  it('should initialize with visible set to false', () => {
    const { result } = renderHook(() => useAppModal());
    expect(result.current.modalConfig.visible).toBe(false);
  });
  it('should showModal with provided configuration', () => {
    const { result } = renderHook(() => useAppModal());
    act(() => {
      result.current.showModal({
        type: 'info',
        title: 'Info Title',
        message: 'This is information.',
      });
    });
    expect(result.current.modalConfig.visible).toBe(true);
    expect(result.current.modalConfig.title).toBe('Info Title');
    expect(result.current.modalConfig.type).toBe('info');
  });
  it('should hideModal when requested', () => {
    const { result } = renderHook(() => useAppModal());
    act(() => {
      result.current.showModal({
        type: 'info',
        title: 'Title',
      });
    });
    act(() => {
      result.current.hideModal();
    });
    expect(result.current.modalConfig.visible).toBe(false);
  });
  it('should showSuccess with correct configuration and buttons', () => {
    const { result } = renderHook(() => useAppModal());
    const mockOnOk = jest.fn();
    act(() => {
      result.current.showSuccess('Operation Succeeded', 'Description', mockOnOk);
    });
    expect(result.current.modalConfig.visible).toBe(true);
    expect(result.current.modalConfig.type).toBe('success');
    expect(result.current.modalConfig.title).toBe('Operation Succeeded');
    expect(result.current.modalConfig.buttons).toHaveLength(1);
    expect(result.current.modalConfig.buttons![0].label).toBe('OK');
    act(() => {
      result.current.modalConfig.buttons![0].onPress();
    });
    expect(mockOnOk).toHaveBeenCalled();
    expect(result.current.modalConfig.visible).toBe(false);
  });
  it('should showConfirm with yes/no buttons', () => {
    const { result } = renderHook(() => useAppModal());
    const mockConfirm = jest.fn();
    act(() => {
      result.current.showConfirm('Confirm Delete', 'Are you sure?', mockConfirm, 'Delete Now', true);
    });
    expect(result.current.modalConfig.visible).toBe(true);
    expect(result.current.modalConfig.type).toBe('warning');
    expect(result.current.modalConfig.buttons).toHaveLength(2);
    expect(result.current.modalConfig.buttons![0].label).toBe('Hủy');
    expect(result.current.modalConfig.buttons![1].label).toBe('Delete Now');
  });
});
