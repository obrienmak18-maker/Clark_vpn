import React, { useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, StyleSheet, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Wifi, Globe, Signal, TrendingUp, Check } from 'lucide-react-native';
import axios from 'axios';
import { useVpnStore } from '../store/useVpnStore';
import { Server } from '../types';
import { C } from '../theme';

const MOCK_SERVERS: Server[] = [
  { id: '1', name: 'Paris Premium', location: 'France', flag: '🇫🇷', ipAddress: '185.235.40.1', port: 443, protocol: 'V2Ray/Xray', load: 25, ping: 28 },
  { id: '2', name: 'Frankfurt Gaming', location: 'Allemagne', flag: '🇩🇪', ipAddress: '185.235.41.2', port: 443, protocol: 'V2Ray/Xray', load: 42, ping: 15 },
  { id: '3', name: 'London Ultra', location: 'Royaume-Uni', flag: '🇬🇧', ipAddress: '185.235.42.3', port: 443, protocol: 'HTTP Inject', load: 31, ping: 35 },
  { id: '4', name: 'New York Fast', location: 'États-Unis', flag: '🇺🇸', ipAddress: '185.235.43.4', port: 443, protocol: 'SSH', load: 78, ping: 112 },
  { id: '5', name: 'Amsterdam Private', location: 'Pays-Bas', flag: '🇳🇱', ipAddress: '185.235.44.5', port: 443, protocol: 'VLess', load: 18, ping: 22 },
  { id: '6', name: 'Singapore Asia', location: 'Singapour', flag: '🇸🇬', ipAddress: '185.235.45.6', port: 443, protocol: 'V2Ray/Xray', load: 55, ping: 190 },
  { id: '7', name: 'Tokyo Express', location: 'Japon', flag: '🇯🇵', ipAddress: '185.235.46.7', port: 443, protocol: 'V2Ray/Xray', load: 60, ping: 210 },
  { id: '8', name: 'Sydney Oceania', location: 'Australie', flag: '🇦🇺', ipAddress: '185.235.47.8', port: 443, protocol: 'Shadowsocks', load: 33, ping: 280 },
];

function pingColor(ping: number): string {
  if (ping < 60) return C.green;
  if (ping < 120) return C.yellow;
  return C.red;
}

function loadColor(load: number): string {
  if (load < 40) return C.green;
  if (load < 70) return C.yellow;
  return C.red;
}

export default function ServerListScreen() {
  const navigation = useNavigation();
  const { currentServer, setCurrentServer } = useVpnStore();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServers = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3000/api/servers/active', {
        headers: { Authorization: 'Bearer MOCK_TOKEN' },
        timeout: 3000,
      });
      setServers(response.data.servers);
    } catch {
      setServers(MOCK_SERVERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchServers(); }, []);

  const handleSelect = (server: Server) => {
    setCurrentServer(server);
    navigation.goBack();
  };

  const renderServer = ({ item }: { item: Server }) => {
    const selected = currentServer?.id === item.id;
    const pc = pingColor(item.ping);
    const lc = loadColor(item.load);

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        activeOpacity={0.75}
        style={[styles.serverCard, selected && styles.serverCardSelected]}
      >
        {/* Flag */}
        <View style={[styles.flagBox, selected && styles.flagBoxSelected]}>
          <Text style={styles.flagText}>{item.flag}</Text>
        </View>

        {/* Info */}
        <View style={styles.serverInfo}>
          <View style={styles.serverTopRow}>
            <Text style={styles.serverName} numberOfLines={1}>{item.name}</Text>
            {selected && <Check size={14} color={C.tealLight} strokeWidth={2.5} />}
          </View>
          <View style={styles.serverSubRow}>
            <View style={[styles.protoBadge, selected && styles.protoBadgeSelected]}>
              <Text style={[styles.protoText, selected && styles.protoTextSelected]}>
                {item.protocol}
              </Text>
            </View>
            <Text style={styles.locText}>{item.location}</Text>
          </View>
        </View>

        {/* Ping & Load */}
        <View style={styles.serverRight}>
          <View style={styles.pingBox}>
            <Wifi size={11} color={pc} strokeWidth={2} />
            <Text style={[styles.pingText, { color: pc }]}>{item.ping}ms</Text>
          </View>
          <View style={styles.loadRow}>
            <Text style={styles.loadLabel}>CHARGE</Text>
            <View style={styles.loadBar}>
              <View style={[styles.loadFill, { width: `${item.load}%` as any, backgroundColor: lc }]} />
            </View>
            <Text style={[styles.loadPct, { color: lc }]}>{item.load}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.teal} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color={C.white} strokeWidth={2.2} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Sélectionner un Serveur</Text>
          <Text style={styles.headerSub}>{servers.length} serveurs disponibles</Text>
        </View>
        <Globe size={22} color="rgba(255,255,255,0.7)" />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.teal} />
          <Text style={styles.loadingText}>Chargement des serveurs...</Text>
        </View>
      ) : (
        <FlatList
          data={servers}
          keyExtractor={item => item.id}
          renderItem={renderServer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchServers(); }}
              tintColor={C.teal}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.teal,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, color: C.white, fontWeight: '800' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: C.textSub, fontSize: 13 },

  listContent: { padding: 14 },
  separator: { height: 8 },

  serverCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 14, gap: 12,
  },
  serverCardSelected: { borderColor: C.teal, backgroundColor: C.tealGlow },

  flagBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  flagBoxSelected: { borderColor: C.teal },
  flagText: { fontSize: 26 },

  serverInfo: { flex: 1, gap: 5 },
  serverTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  serverName: { fontSize: 14, color: C.text, fontWeight: '800', flex: 1 },
  serverSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  protoBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border2,
  },
  protoBadgeSelected: { backgroundColor: C.tealGlow, borderColor: C.teal },
  protoText: { fontSize: 9, color: C.textSub, fontWeight: '700', letterSpacing: 0.5 },
  protoTextSelected: { color: C.tealLight },
  locText: { fontSize: 11, color: C.textDim },

  serverRight: { alignItems: 'flex-end', gap: 6 },
  pingBox: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pingText: { fontSize: 11, fontWeight: '800' },
  loadRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  loadLabel: { fontSize: 8, color: C.textDim, fontWeight: '700', letterSpacing: 1 },
  loadBar: { width: 40, height: 4, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  loadFill: { height: '100%', borderRadius: 3 },
  loadPct: { fontSize: 10, fontWeight: '700', minWidth: 28, textAlign: 'right' },
});
