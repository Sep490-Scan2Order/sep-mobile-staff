import { validatePasswordPattern } from './validation';
describe('validation utility', () => {
  describe('validatePasswordPattern', () => {
    it('returns error if password is empty', () => {
      expect(validatePasswordPattern('')).toBe('Vui lòng nhập mật khẩu');
    });
    it('returns error if password is too short', () => {
      expect(validatePasswordPattern('Ab1!')).toBe('Mật khẩu phải có ít nhất 8 ký tự');
    });
    it('returns error if password has no uppercase letter', () => {
      expect(validatePasswordPattern('password123!')).toBe('Mật khẩu phải có ít nhất 1 chữ in hoa');
    });
    it('returns error if password has no number', () => {
      expect(validatePasswordPattern('Password!')).toBe('Mật khẩu phải có ít nhất 1 chữ số');
    });
    it('returns error if password has no special character', () => {
      expect(validatePasswordPattern('Password123')).toBe('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    });
    it('returns null if password is valid', () => {
      expect(validatePasswordPattern('Password123!')).toBeNull();
    });
  });
});
