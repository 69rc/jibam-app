export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jibam-backend.vercel.app/api/v1';
export const PHARMACIST_WHATSAPP = import.meta.env.VITE_PHARMACIST_WHATSAPP || '2348166444533';
export const DELIVERY_FEE = 500; // fallback for cart page before address is known

// ── Default zones (used as fallback if API is unreachable) ────────────────────
export const DEFAULT_DELIVERY_ZONES = [
  { id: 'zone1', label: 'Central Kano', fee: 300, areas: ['fagge','dala','gwale','kano municipal','kano central','sabon gari','tudun wada','kabuga','dakata','rijiyar lemo'] },
  { id: 'zone2', label: 'Inner Suburbs', fee: 500, areas: ['nassarawa','tarauni','ungogo','kumbotso','dorayi','sharada','danagundi','kawaji','yankura','sani abacha','bakin zuwo','unguwar uku','hotoro','zango','diso','rimin gado'] },
  { id: 'zone3', label: 'Outer Kano',   fee: 800, areas: ['wudil','gwarzo','rano','bichi','karaye','rogo','sumaila','madobi','garun mallam','tofa','dawakin tofa','dawakin kudu','kibiya','minjibir','gezawa','bagwai','bebeji','ajingi','warawa'] },
];

/**
 * Calculate delivery fee given zones array from API + customer address.
 * Returns { fee, zone, outsideKano }
 */
export function getDeliveryFee(zones = DEFAULT_DELIVERY_ZONES, state = '', city = '') {
  const s = state.trim().toLowerCase();
  const c = city.trim().toLowerCase();

  if (!s.includes('kano')) return { fee: 0, zone: null, outsideKano: true };

  for (const zone of zones) {
    if ((zone.areas || []).some((area) => c.includes(area) || area.includes(c))) {
      return { fee: zone.fee, zone: zone.label, outsideKano: false };
    }
  }

  // Kano but area not matched — use zone2 fee as default
  const fallback = zones.find((z) => z.id === 'zone2') || zones[1] || zones[0];
  return { fee: fallback?.fee ?? 500, zone: 'Kano', outsideKano: false };
}

// Keep old signature for backward compat (KANO_ZONES)
export const KANO_ZONES = Object.fromEntries(
  DEFAULT_DELIVERY_ZONES.map((z) => [z.id, z])
);

export const ORDER_STATUSES = {
  pending:          { label: 'Pending',          color: '#F57C00', bg: '#FFF3E0' },
  paid:             { label: 'Paid',             color: '#0090CC', bg: '#E0F5FD' },
  processing:       { label: 'Processing',       color: '#7B1FA2', bg: '#F3E5F5' },
  ready:            { label: 'Ready',            color: '#0097A7', bg: '#E0F7FA' },
  out_for_delivery: { label: 'Out for Delivery', color: '#E65100', bg: '#FBE9E7' },
  delivered:        { label: 'Delivered',        color: '#1B5E20', bg: '#E8F5E9' },
  cancelled:        { label: 'Cancelled',        color: '#C62828', bg: '#FFEBEE' },
};

export const PAYMENT_STATUS = {
  unpaid:   { label: 'Unpaid',   color: '#F57C00' },
  paid:     { label: 'Paid',     color: '#1B5E20' },
  refunded: { label: 'Refunded', color: '#8BC34A' },
  failed:   { label: 'Failed',   color: '#C62828' },
};
