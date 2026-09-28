// ============================================================
// Wristloom — Booking Wizard Zustand Store
// ============================================================
import { create } from 'zustand';

export interface BookingAddress {
  fullName: string;
  phone: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  savedAddressId?: string;
}

export interface BookingStore {
  // Step tracking
  step: number;
  setStep: (s: number) => void;

  // Step 1 — Service
  serviceType: string;
  estimatedPrice: number;
  setService: (type: string, price: number) => void;

  // Step 2 — Watch details
  watchBrand: string;
  watchModel: string;
  watchReferenceNumber: string;
  issueDescription: string;
  issueImages: string[];
  setWatchDetails: (d: Partial<BookingStore>) => void;
  addIssueImage: (url: string) => void;

  // Step 3 — Address
  address: BookingAddress | null;
  addressId: string | null;
  setAddress: (a: BookingAddress, id?: string) => void;

  // Step 4 — Date/Time
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd: string;
  timeSlotLabel: string;
  setDateTime: (date: string, start: string, end: string, label: string) => void;

  // Step 6 — Payment
  depositAmount: number;

  // Confirmed booking
  bookingId: string | null;
  bookingReference: string | null;
  setConfirmed: (id: string, ref: string) => void;

  // Reset
  reset: () => void;
}

const INITIAL: Omit<BookingStore,
  'setStep' | 'setService' | 'setWatchDetails' | 'addIssueImage' |
  'setAddress' | 'setDateTime' | 'setConfirmed' | 'reset'
> = {
  step: 1,
  serviceType: '',
  estimatedPrice: 0,
  watchBrand: '',
  watchModel: '',
  watchReferenceNumber: '',
  issueDescription: '',
  issueImages: [],
  address: null,
  addressId: null,
  scheduledDate: '',
  scheduledTimeStart: '',
  scheduledTimeEnd: '',
  timeSlotLabel: '',
  depositAmount: 0,
  bookingId: null,
  bookingReference: null,
};

export const useBookingStore = create<BookingStore>((set) => ({
  ...INITIAL,
  setStep: (step) => set({ step }),
  setService: (serviceType, estimatedPrice) =>
    set({ serviceType, estimatedPrice, depositAmount: Math.round(estimatedPrice * 0.3) }),
  setWatchDetails: (d) => set(d as any),
  addIssueImage: (url) => set((s) => ({ issueImages: [...s.issueImages, url] })),
  setAddress: (address, id) => set({ address, addressId: id ?? null }),
  setDateTime: (scheduledDate, scheduledTimeStart, scheduledTimeEnd, timeSlotLabel) =>
    set({ scheduledDate, scheduledTimeStart, scheduledTimeEnd, timeSlotLabel }),
  setConfirmed: (bookingId, bookingReference) => set({ bookingId, bookingReference }),
  reset: () => set(INITIAL as any),
}));
