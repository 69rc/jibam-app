export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jibam-backend.vercel.app/api/v1';
export const PHARMACIST_WHATSAPP = import.meta.env.VITE_PHARMACIST_WHATSAPP || '2348000000000';
export const DELIVERY_FEE = 500;

export const ORDER_STATUSES = {
  pending:          { label: 'Pending',          color: '#F57C00', bg: '#FFF3E0' },
  paid:             { label: 'Paid',             color: '#0090CC', bg: '#E0F5FD' },
  processing:       { label: 'Processing',       color: '#7B1FA2', bg: '#F3E5F5' },
  ready:            { label: 'Ready',            color: '#0097A7', bg: '#E0F7FA' },
  out_for_delivery: { label: 'Out for Delivery', color: '#E65100', bg: '#FBE9E7' },
  delivered:        { label: 'Delivered',        color: '#0D1B5E', bg: '#E8ECF8' },
  cancelled:        { label: 'Cancelled',        color: '#C62828', bg: '#FFEBEE' },
};

export const PAYMENT_STATUS = {
  unpaid:   { label: 'Unpaid',   color: '#F57C00' },
  paid:     { label: 'Paid',     color: '#0D1B5E' },
  refunded: { label: 'Refunded', color: '#00AEEF' },
  failed:   { label: 'Failed',   color: '#C62828' },
};
