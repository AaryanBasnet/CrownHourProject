import apiClient from '@api/axios';

const createPaymentIntent = async (items, shippingAddress) => {
    const response = await apiClient.post('/payment/create-intent', {
        items,
        shippingAddress
    });
    return response.data;
};

export const paymentService = {
    createPaymentIntent
};
