import axiosPublicClient from './publicClient';
import { API_BASE_URL } from '@/config/apiConfig';

describe('publicClient', () => {
  it('should be configured with correct baseURL and headers', () => {
    expect(axiosPublicClient.defaults.baseURL).toBe(API_BASE_URL);
    expect(axiosPublicClient.defaults.headers['Content-Type']).toBe('application/json');
  });
});
