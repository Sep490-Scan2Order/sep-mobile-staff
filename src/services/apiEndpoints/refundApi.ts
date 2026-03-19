import axiosPrivate from '../axios/privateClient';

export const refundApi = {
  createRefund: (data: {
    orderId: string;
    refundType: number;
    responsibleStaffId: string;
    note: string;
  }) => {
    return axiosPrivate.post('/Refund', data);
  },

  confirmSystemPayment: (formData: FormData) => {
    return axiosPrivate.post('/Refund/confirm-system-payment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
