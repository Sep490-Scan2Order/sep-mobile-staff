import { API_BASE_URL, SIGNALR_URL } from './apiConfig';
describe('apiConfig', () => {
  it('should export API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });
  it('should export SIGNALR_URL', () => {
    expect(SIGNALR_URL).toBeDefined();
    expect(typeof SIGNALR_URL).toBe('string');
  });
});
