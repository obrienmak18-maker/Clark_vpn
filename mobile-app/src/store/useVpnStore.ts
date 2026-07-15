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

  // Timer internals
  _connectedAt: number | null;
  _timerRef: ReturnType<typeof setInterval> | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

const formatTotal = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const RESET_STATS: VpnStats = {
  uploadRate: '0 B/s',
  downloadRate: '0 B/s',
  ping: '--',
  connectedTime: '00:00:00',
  totalDataUsed: '0 B',
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useVpnStore = create<VpnState>((set, get) => ({
  status: 'DISCONNECTED',
  activeConfig: null,
  configs: [],
  currentServer: null,
  stats: { ...RESET_STATS },
  logs: [],
  _connectedAt: null,
  _timerRef: null,

  // ── Config / Server ─────────────────────────────────────────────────────────

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
    get().addLog(`Serveur: ${server.name} (${server.location}) — ping ${server.ping}ms`, 'info');
  },

  setStats: (newStats) => set(s => ({ stats: { ...s.stats, ...newStats } })),

  // ── Logs ────────────────────────────────────────────────────────────────────

  addLog: (message, type) => {
    const entry: LogEntry = { time: now(), message, type };
    set(s => ({ logs: [...s.logs.slice(-199), entry] }));
  },

  clearLogs: () => set({ logs: [] }),

  // ── Connect ─────────────────────────────────────────────────────────────────

  connect: async (protocol) => {
    const { activeConfig, currentServer, addLog, _timerRef } = get();

    // Guard: nothing to connect to
    if (!activeConfig && !currentServer) {
      addLog('Erreur: aucune configuration ni serveur sélectionné', 'error');
      set({ status: 'ERROR' });
      return;
    }

    // Clear any stale timer
    if (_timerRef) clearInterval(_timerRef);

    set({ status: 'CONNECTING', _timerRef: null });

    const proto = protocol || activeConfig?.protocol || 'V2Ray/Xray';
    addLog(`Initialisation du tunnel ${proto}…`, 'info');

    if (activeConfig) {
      addLog(`Config: ${activeConfig.name}`, 'info');
      addLog(`Serveur: ${activeConfig.host}:${activeConfig.port}`, 'info');
      if (activeConfig.transport) addLog(`Transport: ${activeConfig.transport}`, 'info');
      if (activeConfig.sni) addLog(`SNI: ${activeConfig.sni}`, 'info');
    } else if (currentServer) {
      addLog(`Serveur: ${currentServer.name} (${currentServer.ipAddress}:${currentServer.port})`, 'info');
    }

    try {
      const payload = activeConfig
        ? JSON.stringify(activeConfig)
        : JSON.stringify({ server: currentServer, protocol: proto });

      const result = await VpnBridge.startVpn(payload);

      if (result === 'STARTED') {
        // ── Permission already granted, service launched ──────────────────────
        _onConnected(proto);

      } else if (result === 'PERMISSION_REQUESTED') {
        // Legacy path: native module resolved immediately without waiting for
        // onActivityResult (old behaviour). Treat the same as CANCELLED so the
        // user sees the correct state; they can tap Connect again after granting.
        addLog('En attente de la permission VPN Android…', 'warn');
        set({ status: 'CONNECTING' });
        // The updated VpnBridgeModule now waits in onActivityResult, so this
        // branch is only hit on very old builds. We stay CONNECTING and let
        // the next result (STARTED / CANCELLED) drive the transition.

      } else if (result === 'CANCELLED') {
        // ── User dismissed the Android VPN permission dialog ──────────────────
        addLog('Connexion annulée par l\'utilisateur.', 'warn');
        set({ status: 'DISCONNECTED', _connectedAt: null, _timerRef: null, stats: { ...RESET_STATS } });

      } else {
        addLog(`Résultat inattendu: ${result}`, 'error');
        set({ status: 'ERROR' });
      }

    } catch (error: any) {
      addLog(`✗ Échec de connexion: ${error?.message || 'Erreur inconnue'}`, 'error');
      set({ status: 'ERROR', _timerRef: null });
    }

    // ── Helper: called once the VPN is confirmed STARTED ──────────────────────
    function _onConnected(proto: string) {
      const connectedAt = Date.now();
      const ping = currentServer
        ? `${currentServer.ping}ms`
        : `${Math.floor(Math.random() * 60) + 15}ms`;

      set({ status: 'CONNECTED', _connectedAt: connectedAt });
      get().setStats({ ping, uploadRate: '0 KB/s', downloadRate: '0 KB/s', connectedTime: '00:00:00', totalDataUsed: '0 B' });
      get().addLog(`✓ Connecté ! Ping: ${ping}`, 'success');
      get().addLog(`Protocole actif: ${proto}`, 'success');

      let totalBytes = 0;

      const timer = setInterval(() => {
        const state = get();
        if (state.status !== 'CONNECTED' || !state._connectedAt) {
          clearInterval(timer);
          return;
        }

        // Simulate realistic traffic (100 KB/s – 2 MB/s down, 10–400 KB/s up)
        const downBytes = Math.floor(Math.random() * 1_800_000 + 100_000);
        const upBytes   = Math.floor(Math.random() * 380_000  + 10_000);
        totalBytes += downBytes + upBytes;

        state.setStats({
          connectedTime:  formatDuration(state._connectedAt!),
          downloadRate:   formatBytes(downBytes),
          uploadRate:     formatBytes(upBytes),
          totalDataUsed:  formatTotal(totalBytes),
        });
      }, 1000);

      set({ _timerRef: timer });
    }
  },

  // ── Disconnect ───────────────────────────────────────────────────────────────

  disconnect: async () => {
    const { _timerRef, addLog } = get();

    // Stop the live stats timer immediately
    if (_timerRef) clearInterval(_timerRef);

    set({ status: 'DISCONNECTING', _timerRef: null });
    addLog('Déconnexion en cours…', 'warn');

    try {
      await VpnBridge.stopVpn();
      set({
        status: 'DISCONNECTED',
        _connectedAt: null,
        _timerRef: null,
        stats: { ...RESET_STATS },
      });
      addLog('VPN déconnecté.', 'info');
    } catch (error: any) {
      addLog(`Erreur déconnexion: ${error?.message}`, 'error');
      set({ status: 'DISCONNECTED', _connectedAt: null, _timerRef: null, stats: { ...RESET_STATS } });
    }
  },
}));
