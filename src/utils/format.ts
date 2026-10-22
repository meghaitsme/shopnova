export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {   //'en-US
    style: 'currency',
    currency: 'INR',  //USD
     maximumFractionDigits: 0,
  }).format(price);
};