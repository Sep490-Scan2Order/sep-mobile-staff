import { isToday } from './dateUtils';

describe('dateUtils', () => {
  describe('isToday', () => {
    it('returns true for today date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
      expect(isToday(today.toISOString())).toBe(true);
    });

    it('returns false for yesterday date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
      expect(isToday(yesterday.toISOString())).toBe(false);
    });

    it('returns false for future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('returns false for null or empty string', () => {
      expect(isToday(null as any)).toBe(false);
      expect(isToday('')).toBe(false);
    });
  });
});
