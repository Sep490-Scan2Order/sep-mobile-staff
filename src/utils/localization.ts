
export const translateRole = (role?: string): string => {
  if (!role) return 'N/A';
  const roleMap: Record<string, string> = {
    'Cashier': 'Thu ngân',
    'Staff': 'Nhân viên',
    'Admin': 'Quản trị viên',
    'Tenant': 'Chủ cửa hàng'
  };
  return roleMap[role] || role;
};
