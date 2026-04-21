
export const validatePasswordPattern = (password: string): string | null => {
  if (!password) {
    return 'Vui lòng nhập mật khẩu';
  }
  if (password.length < 8) {
    return 'Mật khẩu phải có ít nhất 8 ký tự';
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return 'Mật khẩu phải có ít nhất 1 chữ in hoa';
  }
  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    return 'Mật khẩu phải có ít nhất 1 chữ số';
  }
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasSpecialChar) {
    return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
  }
  return null;
};
