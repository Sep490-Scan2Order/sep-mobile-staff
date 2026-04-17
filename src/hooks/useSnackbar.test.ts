import { renderHook, act } from '@testing-library/react-native';
import { useSnackbar } from './useSnackbar';
describe('useSnackbar', () => {
  it('should initialize with visible set to false', () => {
    const { result } = renderHook(() => useSnackbar());
    expect(result.current.config.visible).toBe(false);
  });
  it('should show success message when showSuccess is called', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSnackbar());
    act(() => {
      result.current.showSuccess('Operation successful');
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current.config.visible).toBe(true);
    expect(result.current.config.message).toBe('Operation successful');
    expect(result.current.config.type).toBe('success');
  });
  it('should show error message when showError is called', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSnackbar());
    act(() => {
      result.current.showError('Operation failed');
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current.config.visible).toBe(true);
    expect(result.current.config.message).toBe('Operation failed');
    expect(result.current.config.type).toBe('error');
  });
  it('should hide snackbar when hide is called', () => {
    const { result } = renderHook(() => useSnackbar());
    act(() => {
      result.current.showInfo('Hide me');
    });
    act(() => {
      result.current.hide();
    });
    expect(result.current.config.visible).toBe(false);
  });
});
