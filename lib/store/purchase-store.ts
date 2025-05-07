import { create } from 'zustand';

interface PurchaseState {
  isBottomSheetOpen: boolean;
  openBottomSheet: () => void;
  closeBottomSheet: () => void;
}

export const usePurchaseStore = create<PurchaseState>((set) => ({
  isBottomSheetOpen: false,
  openBottomSheet: () => set({ isBottomSheetOpen: true }),
  closeBottomSheet: () => set({ isBottomSheetOpen: false }),
}));
