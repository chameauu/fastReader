import { create } from 'zustand';

type RSVPSource = 'selection' | 'chapter' | 'document';

interface RsvpState {
  isActive: boolean;
  text: string;
  source: RSVPSource;
  launchRSVP: (text: string, source: RSVPSource) => void;
  closeRSVP: () => void;
}

export const useRsvpStore = create<RsvpState>((set) => ({
  isActive: false,
  text: '',
  source: 'document',

  launchRSVP: (text, source) => set({ isActive: true, text, source }),

  closeRSVP: () => set({ isActive: false, text: '', source: 'document' }),
}));
