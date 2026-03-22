import axiosPrivate from '../axios/privateClient';
import { RefundRequest } from '../../type';

export const refundApi = {
  createRefund: (data: RefundRequest) => {
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
