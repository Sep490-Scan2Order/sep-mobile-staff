import axiosPrivate from '../axios/privateClient';
const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
};
export const refundApi = {
  createRefund: async (formData: FormData) => {
    const response = await axiosPrivate.post('/Refund', formData, {
      headers: MULTIPART_HEADERS,
      transformRequest: (data) => data,
    });
    return response.data;
  },
  confirmSystemPayment: async (formData: FormData) => {
    const response = await axiosPrivate.post(
      '/Refund/confirm-system-payment',
      formData,
      {
        headers: MULTIPART_HEADERS,
        transformRequest: (data) => data,
      },
    );
    return response.data;
  },
};