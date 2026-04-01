import privateClient from './privateClient';
import * as index from './index';

describe('axios index', () => {
  it('should export privateClient as default export', () => {
    expect(index.default).toBe(privateClient);
  });

  it('should export privateClient', () => {
    expect(index.axiosPrivate).toBe(privateClient);
  });
});
