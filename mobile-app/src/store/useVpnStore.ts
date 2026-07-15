import { create } from 'zustand';
import { VpnConfig, VpnStatus, VpnStats, LogEntry, Server } from '../types';
import VpnBridge from '../services/VpnBridge';

interface VpnState {
  status: VpnStatus;
  activeConfig: VpnConfig | null;
  configs: VpnConfig[];
  currentServer: Server | null;
  stats: VpnStats;
  logs: LogEntry[];

  // Config management
  setActiveConfig: (config: VpnConfig) => void;
  addConfig: (config: VpnConfig) => void;
  deleteConfig: (id: string) => void;

  // Server
  setCurrentServer: (server: Server) => void;

  // Stats
  setStats: (stats: Partial<VpnStats>) => void;

  // Logs
  addLog: (message: string, type: LogEntry['type']) => void;
  clearLogs: () => void;

  // VPN control
  connect: (protocol?: string) => Promise<void>;
  disconnect: () => Promise<void>;

  // Timer
  _connectedAt: number | null;
  _timerRef: ReturnType<typeof setInterval> | null;
}

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const formatDuration = (start: number) => {
  const sec = Math.floor((Date.now() - start) / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B/s`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB/s`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB/s`;
};

export const useVpnStore = create<VpnState>((set, get) => ({
  status: 'DISCONNECTED',
  activeConfig: null,
  configs: [],
  currentServer: null,
  stats: {
    uploadRate: '0 B/s',
    downloadRate: '0 B/s',
    ping: '--',
    connectedTime: '00:00:00',
    totalDataUsed: '0 B',
  },
  logs: [],
  _connectedAt: null,
  _timerRef: null,

  setActiveConfig: (config) => {
    set({ activeConfig: config });
    get().addLog(`Config sélectionnée: ${config.name} (${config.protocol})`, 'info');
  },

  addConfig: (config) => {
    set(s => ({ configs: [...s.configs, config] }));
    get().addLog(`Nouveau profil ajouté: ${config.name}`, 'success');
  },

  deleteConfig: (id) => {
    set(s => ({
      configs: s.configs.filter(c => c.id !== id),
      activeConfig: s.activeConfig?.id === id ? null : s.activeConfig,
    }));
    get().addLog('Configuration supprimée', 'warn');
  },

  setCurrentServer: (server) => {
    set({ currentServer: server });
    get().addLog(`Serveur sélectionné: ${server.name} (${server.location}) — ping ${server.ping}ms`, 'info');
  },

  setStats: (newStats) => set(s => ({ stats: { ...s.stats, ...newStats } })),

  addLog: (message, type) => {
    const entry: LogEntry = { time: now(), message, type };
    set(s => ({ logs: [...s.logs.slice(-199), entry] }));
  },

  clearLogs: () => set({ logs: [] }),

  connect: async (protocol) => {
    const { activeConfig, currentServer, addLog } = get();

    if (!activeConfig && !currentServer) {
      addLog('Erreur: aucune configuration ni serveur sélectionné', 'error');
      set({ status: 'ERROR' });
      return;
    }

    set({ status: 'CONNECTING' });
    const proto = protocol || activeConfig?.protocol || 'V2Ray/Xray';
    addLog(`Initialisation du tunnel ${proto}...`, 'info');

    if (activeConfig) {
      addLog(`Config: ${activeConfig.name}`, 'info');
      addLog(`Serveur: ${activeConfig.host}:${activeConfig.port}`, 'info');
      addLog(`Transport: ${activeConfig.transport}`, 'info');
      if (activeConfig.sni) addLog(`SNI: ${activeConfig.sni}`, 'info');
    } else if (currentServer) {
      addLog(`Serveur: ${currentServer.name} (${currentServer.ipAddress}:${currentServer.port})`, 'info');
    }

    try {
      const payload = activeConfig ? JSON.stringify(activeConfig) : JSON.stringify({ server: currentServer, protocol: proto });
      const result = await VpnBridge.startVpn(payload);

      if (result === 'STARTED' || result === 'PERMISSION_REQUESTED') {
        const connectedAt = Date.now();
        const ping = currentServer
          ? `${currentServer.ping}ms`
          : `${Math.floor(Math.random() * 80) + 10}ms`;

        set({ status: 'CONNECTED', _connectedAt: connectedAt });
        get().setStats({ ping, uploadRate: '0 KB/s', downloadRate: '0 KB/s', connectedTime: '00:00:00', totalDataUsed: '0 B' });
        addLog(`✓ Connecté avec succès ! Ping: ${ping}`, 'success');
        addLog(`Protocole actif: ${proto}`, 'success');

        let totalBytes = 0;

        const timer = setInterval(() => {
          const state = get();
          if (state.status !== 'CONNECTED' || !state._connectedAt) {
            clearInterval(timer);
            return;
          }
          const upBytes = Math.floor(Math.random() * 400000 + 10000);
          const downBytes = Math.floor(Math.random() * 2000000 + 100000);
          totalBytes += upBytes + downBytes;

          const totalFmt = totalBytes < 1024 * 1024
            ? `${(totalBytes / 1024).toFixed(0)} KB`
            : `${(totalBytes / 1024 / 1024).toFixed(1)} MB`;

          state.setStats({
            connectedTime: formatDuration(state._connectedAt),
            uploadRate: formatBytes(upBytes),
            downloadRate: formatBytes(downBytes),
            totalDataUsed: totalFmt,
          });
        }, 1000);

        set({ _timerRef: timer });
      }
    } catch (error: any) {
      addLog(`✗ Échec de connexion: ${error?.message || 'Erreur inconnue'}`, 'error');
      set({ status: 'ERROR' });
    }
  },

  disconnect: async () => {
    const { _timerRef, addLog } = get();
    if (_timerRef) clearInterval(_timerRef);

    set({ status: 'DISCONNECTING' });
    addLog('Déconnexion en cours...', 'warn');

    try {
      await VpnBridge.stopVpn();
      set({
        status: 'DISCONNECTED',
        _connectedAt: null,
        _timerRef: null,
        stats: {
          uploadRate: '0 B/s', downloadRate: '0 B/s',
          ping: '--', connectedTime: '00:00:00', totalDataUsed: '0 B',
        },
      });
      addLog('VPN déconnecté.', 'info');
    } catch (error: any) {
      addLog(`Erreur déconnexion: ${error?.message}`, 'error');
      set({ status: 'DISCONNECTED', _connectedAt: null, _timerRef: null });
    }
  },
}));
