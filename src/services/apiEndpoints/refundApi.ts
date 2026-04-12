import axiosPrivate from '../axios/privateClient';

// Trong React Native, khi set Content-Type: multipart/form-data + data là FormData,
// XHR layer tự động append boundary đúng.
// transformRequest: (data) => data ngăn Axios serialize FormData thành string.
const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
};

export const refundApi = {
  createRefund: async (formData: FormData) => {
    console.log('🚀 CALL API REFUND');

    const response = await axiosPrivate.post('/Refund', formData, {
      headers: MULTIPART_HEADERS,
      transformRequest: (data) => data,
    });

    return response.data;
  },

  confirmSystemPayment: async (formData: FormData) => {
    console.log('🚀 CONFIRM SYSTEM PAYMENT');

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