import axiosPrivate from '../axios/privateClient'; // Trỏ đúng đường dẫn của bạn

export const refundApi = {
  createRefund: async (formData: FormData) => {
    console.log('🚀 CALL API REFUND (AXIOS PRO)');

    const response = await axiosPrivate.post('/Refund', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // 👇 Vũ khí chống Stream Closed trên React Native
      transformRequest: (data) => data, 
    });

    // Trả về thẳng data để bên component dễ dùng
    return response.data; 
  },

  confirmSystemPayment: async (formData: FormData) => {
    console.log('🚀 CONFIRM SYSTEM PAYMENT (AXIOS PRO)');

    const response = await axiosPrivate.post('/Refund/confirm-system-payment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data,
    });

    return response.data;
  },
};