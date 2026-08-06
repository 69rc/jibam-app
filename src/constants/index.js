export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jibam-backend.vercel.app/api/v1';
export const PHARMACIST_WHATSAPP = import.meta.env.VITE_PHARMACIST_WHATSAPP || '2348166444533';

// ── Delivery fee is now dynamic — see getDeliveryFee() below ──────────────
// Fallback flat fee used on Cart page before the address is known
export const DELIVERY_FEE = 500;

// ── Kano delivery zones ───────────────────────────────────────────────────
// Zone 1 — Central / very close to pharmacy (Fagge, Dala, Gwale, Kano Municipal)
// Zone 2 — Inner suburbs (Nassarawa, Tarauni, Ungogo, Kumbotso, Dorayi)
// Zone 3 — Outer areas (Wudil, Gwarzo, Rano, Bichi, Karaye, etc.)
// Outside Kano — not served

export const KANO_ZONES = {
  zone1: {
    label: 'Central Kano',
    fee: 300,
    areas: [
      'fagge', 'dala', 'gwale', 'kano municipal', 'kano central',
      'sabon gari', 'tudun wada', 'kabuga', 'dakata', 'rijiyar lemo',
    ],
  },
  zone2: {
    label: 'Inner Suburbs',
    fee: 500,
    areas: [
      'nassarawa', 'tarauni', 'ungogo', 'kumbotso', 'dorayi',
      'sharada', 'danagundi', 'kawaji', 'yankura', 'sani abacha',
      'bakin zuwo', 'unguwar uku', 'hotoro', 'zango', 'diso',
      'rimin gado',
    ],
  },
  zone3: {
    label: 'Outer Kano',
    fee: 800,
    areas: [
      'wudil', 'gwarzo', 'rano', 'bichi', 'karaye', 'rogo',
      'sumaila', 'tudun wada lga', 'madobi', 'garun mallam',
      'tofa', 'dawakin tofa', 'dawakin kudu', 'kibiya', 'minjibir',
      'gezawa', 'bagwai', 'bebeji', 'ajingi', 'warawa',
    ],
  },
};

/**
 * Get delivery fee based on the customer's city/area within Kano.
 * Returns { fee: number, zone: string|null, outsideKano: boolean }
 *
 * @param {string} state  - e.g. "Kano" or "Lagos"
 * @param {string} city   - e.g. "Fagge" or "Nassarawa"
 */
export function getDeliveryFee(state = '', city = '') {
  const s = state.trim().toLowerCase();
  const c = city.trim().toLowerCase();

  // Must be in Kano state
  if (!s.includes('kano')) {
    return { fee: 0, zone: null, outsideKano: true };
  }

  // Match city/area to a zone
  for (const [zoneKey, zone] of Object.entries(KANO_ZONES)) {
    if (zone.areas.some((area) => c.includes(area) || area.includes(c))) {
      return { fee: zone.fee, zone: zone.label, outsideKano: false };
    }
  }

  // Kano state but area not matched — use zone 2 as default
  return { fee: KANO_ZONES.zone2.fee, zone: 'Kano', outsideKano: false };
}

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
