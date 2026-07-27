import { create } from 'zustand';

const useCartStore = create((set) => ({
  itemCount: 0,
  subtotal: 0,

  setCartData: ({ itemCount, subtotal }) => set({ itemCount, subtotal }),
  incrementCount: () => set((s) => ({ itemCount: s.itemCount + 1 })),
  decrementCount: () => set((s) => ({ itemCount: Math.max(0, s.itemCount - 1) })),
  resetCart: () => set({ itemCount: 0, subtotal: 0 }),
}));

export default useCartStore;
