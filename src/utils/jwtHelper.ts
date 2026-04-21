export const decodeJWT = (token: string): any | null => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    let base64String = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padding = 4 - (base64String.length % 4);
    if (padding !== 4) {
      base64String += '='.repeat(padding);
    }
    const jsonString = atob(base64String);
    return JSON.parse(jsonString);
  } catch (error) {
    return null;
  }
};
export const isTokenExpired = (token: string, bufferSeconds: number = 60): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = decoded.exp - bufferSeconds;
    const isExpired = currentTime >= expiryTime;
    return isExpired;
  } catch (error) {
    return true; 
  }
};
export const getTokenExpirationInfo = (token: string): {
  expiryTime: number;
  expiryDate: Date;
  timeRemaining: number;
  isExpired: boolean;
} | null => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    const expiryTime = decoded.exp;
    const expiryDate = new Date(expiryTime * 1000);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = expiryTime - currentTime;
    return {
      expiryTime,
      expiryDate,
      timeRemaining,
      isExpired: timeRemaining <= 0,
    };
  } catch (error) {
    return null;
  }
};
export const getTokenPayload = (token: string): any | null => {
  return decodeJWT(token);
};
