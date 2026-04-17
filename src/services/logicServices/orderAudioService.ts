import { orderApi } from '@/services/apiEndpoints/orderApi';
export async function getOrderAudio(orderCode: number): Promise<string> {
  const axiosResponse = await orderApi.readyForPickup(orderCode);
  const response = axiosResponse.data;
  if (!response?.success) {
    throw new Error(response?.message || 'Không lấy được audio');
  }
  return response.audioUrl;
}
