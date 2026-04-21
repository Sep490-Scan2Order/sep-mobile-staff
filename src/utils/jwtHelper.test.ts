import { decodeJWT, isTokenExpired, getTokenExpirationInfo, getTokenPayload } from './jwtHelper';
describe('jwtHelper', () => {
  const validToken = 'header.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTE2MjM5MDJ9.signature';
  describe('decodeJWT', () => {
    it('decodes a valid token', () => {
      const decoded = decodeJWT(validToken);
      expect(decoded).not.toBeNull();
      expect(decoded.sub).toBe('1234567890');
      expect(decoded.name).toBe('John Doe');
    });
    it('returns null for invalid token format', () => {
      expect(decodeJWT('invalid-token')).toBeNull();
      expect(decodeJWT('part1.part2')).toBeNull();
    });
    it('returns null for empty token', () => {
      expect(decodeJWT('')).toBeNull();
    });
  });
  describe('isTokenExpired', () => {
    it('returns true for expired token', () => {
      const payloadObj = { exp: Math.floor(Date.now() / 1000) - 3600 };
      const expiredPayload = Buffer.from(JSON.stringify(payloadObj)).toString('base64').replace(/=/g, '');
      const expiredToken = `header.${expiredPayload}.signature`;
      expect(isTokenExpired(expiredToken)).toBe(true);
    });
    it('returns false for valid token', () => {
      const payloadObj = { exp: Math.floor(Date.now() / 1000) + 3600 };
      const futurePayload = Buffer.from(JSON.stringify(payloadObj)).toString('base64').replace(/=/g, '');
      const validToken = `header.${futurePayload}.signature`;
      expect(isTokenExpired(validToken)).toBe(false);
    });
  });
  describe('getTokenExpirationInfo', () => {
    it('returns correct info for valid token', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const payloadObj = { exp };
      const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64').replace(/=/g, '');
      const token = `header.${payload}.signature`;
      const info = getTokenExpirationInfo(token);
      expect(info).not.toBeNull();
      expect(info?.expiryTime).toBe(exp);
      expect(info?.isExpired).toBe(false);
      expect(info?.timeRemaining).toBeGreaterThan(0);
    });
    it('returns null if token has no exp', () => {
      const payloadObj = { name: 'No Exp' };
      const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64').replace(/=/g, '');
      const token = `header.${payload}.signature`;
      expect(getTokenExpirationInfo(token)).toBeNull();
    });
  });
  describe('getTokenPayload', () => {
    it('returns the same as decodeJWT', () => {
      const payload = getTokenPayload(validToken);
      expect(payload).not.toBeNull();
      expect(payload.sub).toBe('1234567890');
    });
  });
  describe('Edge Cases & Errors', () => {
    it('handles base64 padding (Line 15)', () => {
      const payloadObj = { a: 1 }; 
      const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64').replace(/=/g, '');
      const payload2 = Buffer.from(JSON.stringify({ ab: 1 })).toString('base64').replace(/=/g, '');
      expect(decodeJWT(`header.${payload2}.signature`)).toEqual({ ab: 1 });
    });
    it('handles invalid JSON in payload (Line 22)', () => {
      const invalidJsonBase64 = Buffer.from('{invalid}').toString('base64');
      expect(decodeJWT(`header.${invalidJsonBase64}.signature`)).toBeNull();
    });
    it('isTokenExpired returns true if no exp (Line 31)', () => {
      const payloadObj = { name: 'No Exp' };
      const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64').replace(/=/g, '');
      const token = `header.${payload}.signature`;
      expect(isTokenExpired(token)).toBe(true);
    });
  });
});
