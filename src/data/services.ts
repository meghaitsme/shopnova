export interface Service {
  slug: string;
  icon: string;
  title: string;
  short: string;
  color: string;
  longDescription: string;
  features: string[];
}

export const SERVICES: Service[] = [
  {
    slug: 'free-shipping',
    icon: 'bx-package',
    title: 'Free Shipping',
    short: 'Free delivery on all orders above ₹999.',
    color: '#3b82f6',
    longDescription:
      'We believe fast, free shipping should be the standard — not a premium add-on. Every ShopNova order above ₹999 ships free to anywhere in India, with tracking updated every step of the way.',
    features: [
      'Free on orders above ₹999',
      'Tracking updates in real-time',
      'Pan-India coverage',
      'Delivered in 3-5 business days',
    ],
  },
  {
    slug: 'easy-returns',
    icon: 'bx-refresh',
    title: 'Easy Returns',
    short: '30-day hassle-free return policy.',
    color: '#10b981',
    longDescription:
      'Changed your mind? Not the right fit? Return any item within 30 days of delivery for a full refund — no questions asked. We even cover the return shipping.',
    features: [
      '30-day return window',
      'Free pickup from your address',
      'Refund processed within 5 days',
      'No restocking fees',
    ],
  },
  {
    slug: 'secure-payments',
    icon: 'bx-shield-quarter',
    title: 'Secure Payments',
    short: '256-bit SSL encryption with Stripe.',
    color: '#8b5cf6',
    longDescription:
      'Your payment information is protected with bank-level encryption. We use Stripe to handle all transactions, so your card details never touch our servers.',
    features: [
      '256-bit SSL encryption',
      'Powered by Stripe',
      'PCI-DSS compliant',
      'Multiple payment options',
    ],
  },
  {
    slug: 'customer-support',
    icon: 'bx-support',
    title: '24/7 Support',
    short: 'Live chat and email, whenever you need us.',
    color: '#f59e0b',
    longDescription:
      'Real humans, ready to help at any hour. Whether it is a product question, an order issue, or just advice — our support team is one message away.',
    features: [
      'Live chat 24/7',
      'Email support',
      'Average response under 2 hours',
      'Hindi + English support',
    ],
  },
  {
    slug: 'gift-wrapping',
    icon: 'bx-gift',
    title: 'Gift Wrapping',
    short: 'Beautiful wrapping with a personal note.',
    color: '#ec4899',
    longDescription:
      'Make every order a memorable gift. Choose from multiple wrapping styles, add a handwritten note, and we will ship it looking beautiful — completely free.',
    features: [
      'Multiple wrapping designs',
      'Handwritten note option',
      'Hidden price on invoice',
      'Free on all orders',
    ],
  },
  {
    slug: 'express-delivery',
    icon: 'bx-rocket',
    title: 'Express Delivery',
    short: 'Same-day dispatch, 2-3 day delivery.',
    color: '#06b6d4',
    longDescription:
      'Need it fast? Order before 2 PM and we dispatch the same day. Express orders arrive within 2-3 business days, in most major cities even sooner.',
    features: [
      'Same-day dispatch',
      'Delivery in 2-3 days',
      'Priority handling',
      'Live tracking SMS',
    ],
  },
];

export const getService = (slug: string) =>
  SERVICES.find((s) => s.slug === slug);
