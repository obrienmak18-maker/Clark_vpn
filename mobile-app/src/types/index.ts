export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Server {
  id: string;
  name: string;
  location: string;
  flag: string;
  ipAddress: string;
  port: number;
  protocol: 'HTTP_INJECTOR' | 'DARK_TUNNEL' | 'OPENVPN' | 'WIREGUARD';
  load: number;
  ping: number;
  configPayload?: string;
}

export interface Profile {
  id: string;
  name: string;
  configData: string; // the .clark configuration string
  isFavorite: boolean;
}

export type VpnStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING' | 'ERROR';

export interface VpnStats {
  uploadRate: string; // e.g. "1.2 MB/s"
  downloadRate: string; // e.g. "3.4 MB/s"
  ping: string; // e.g. "45ms"
  connectedTime: string; // e.g. "00:15:32"
  totalDataUsed: string; // e.g. "450 MB"
}
