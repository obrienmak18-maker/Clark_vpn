import { NativeModules } from 'react-native';

const { VpnBridge } = NativeModules;

export interface VpnBridgeInterface {
  /**
   * Starts the VPN service with the given payload configuration.
   * @param payload The config payload from the .clark file
   */
  startVpn(payload: string): Promise<void>;
  
  /**
   * Stops the active VPN service.
   */
  stopVpn(): Promise<void>;

  /**
   * Returns the current status of the VPN service.
   */
  getStatus(): Promise<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'>;
}

export default VpnBridge as VpnBridgeInterface;
