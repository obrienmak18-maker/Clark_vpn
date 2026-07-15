export type VpnStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'ERROR';

export interface VpnConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: string; // 'SSH' | 'V2Ray/Xray' | 'VLess' | 'HTTP Inject' | 'Shadowsocks' | 'OpenVPN'
  transport: string; // 'TCP' | 'WebSocket' | 'WebSocket + TLS' | 'gRPC' | 'HTTP/2'
  uuid?: string;
  sni?: string;
  path?: string;
  sshUser?: string;
  sshPass?: string;
  injectHost?: string;
  raw?: string;
}

export interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export interface VpnStats {
  uploadRate: string;
  downloadRate: string;
  ping: string;
  connectedTime: string;
  totalDataUsed: string;
}
