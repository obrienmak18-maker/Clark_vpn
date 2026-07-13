import { create } from 'zustand';
import { Server, Profile, VpnStatus, VpnStats } from '../types';
import VpnBridge from '../services/VpnBridge';

interface VpnState {
  status: VpnStatus;
  currentServer: Server | null;
  activeProfile: Profile | null;
  stats: VpnStats;
  setStatus: (status: VpnStatus) => void;
  setCurrentServer: (server: Server | null) => void;
  setActiveProfile: (profile: Profile | null) => void;
  setStats: (stats: Partial<VpnStats>) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useVpnStore = create<VpnState>((set, get) => ({
  status: 'DISCONNECTED',
  currentServer: null,
  activeProfile: null,
  stats: {
    uploadRate: '0 B/s',
    downloadRate: '0 B/s',
    ping: '--',
    connectedTime: '00:00:00',
    totalDataUsed: '0 B',
  },
  
  setStatus: (status) => set({ status }),
  setCurrentServer: (server) => set({ currentServer: server }),
  setActiveProfile: (profile) => set({ activeProfile: profile }),
  setStats: (newStats) => set((state) => ({ stats: { ...state.stats, ...newStats } })),
  
  connect: async () => {
    const { activeProfile } = get();
    set({ status: 'CONNECTING' });
    
    try {
      // Send the .clark configuration string payload to the native Android Service
      const payload = activeProfile ? activeProfile.configData : "DEFAULT_PAYLOAD";
      const result = await VpnBridge.startVpn(payload);
      
      if (result === 'STARTED' || result === 'PERMISSION_REQUESTED') {
         set({ 
           status: 'CONNECTED',
           stats: {
             ...get().stats,
             ping: '42ms', // Real ping would come from native events
           }
         });
      }
    } catch (error) {
      console.error('Failed to start VPN:', error);
      set({ status: 'ERROR' });
    }
  },
  
  disconnect: async () => {
    set({ status: 'DISCONNECTING' });
    
    try {
      await VpnBridge.stopVpn();
      set({ 
        status: 'DISCONNECTED',
        stats: {
          uploadRate: '0 B/s',
          downloadRate: '0 B/s',
          ping: '--',
          connectedTime: '00:00:00',
          totalDataUsed: get().stats.totalDataUsed,
        }
      });
    } catch (error) {
      console.error('Failed to stop VPN:', error);
    }
  },
}));
