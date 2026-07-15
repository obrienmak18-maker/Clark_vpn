import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  FlatList, StyleSheet,
} from 'react-native';
import { useVpnStore } from '../store/useVpnStore';

export default function LogScreen() {
  const { logs, clearLogs } = useVpnStore();
  const flatRef = useRef<FlatList>(null);

  const getColor = (type: string) => {
    if (type === 'error') return '#f85149';
    if (type === 'success') return '#3fb950';
    if (type === 'warn') return '#d29922';
    return '#58a6ff';
  };

  const getPrefix = (type: string) => {
    if (type === 'error') return '[ERR]';
    if (type === 'success') return '[OK] ';
    if (type === 'warn') return '[WRN]';
    return '[INF]';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <View style={styles.header}>
        <Text style={styles.title}>JOURNAL</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={clearLogs}>
          <Text style={styles.clearText}>🗑  EFFACER</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.terminal}>
        <View style={styles.terminalHeader}>
          <View style={[styles.dot, { backgroundColor: '#f85149' }]} />
          <View style={[styles.dot, { backgroundColor: '#d29922' }]} />
          <View style={[styles.dot, { backgroundColor: '#3fb950' }]} />
          <Text style={styles.terminalTitle}>clark-vpn — journal</Text>
        </View>
        <FlatList
          ref={flatRef}
          data={[...logs].reverse()}
          keyExtractor={(_, i) => i.toString()}
          style={styles.logList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 12 }}
          ListEmptyComponent={
            <Text style={styles.emptyLog}>En attente d'événements VPN...</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.logRow}>
              <Text style={styles.logTime}>{item.time}</Text>
              <Text style={[styles.logPrefix, { color: getColor(item.type) }]}>{getPrefix(item.type)}</Text>
              <Text style={[styles.logMsg, { color: getColor(item.type) }]} numberOfLines={3}>{item.message}</Text>
            </View>
          )}
        />
      </View>

      {/* Stats summary */}
      <View style={styles.statsBar}>
        <StatItem label="Total" value={logs.length.toString()} />
        <StatItem label="Erreurs" value={logs.filter(l => l.type === 'error').length.toString()} color="#f85149" />
        <StatItem label="OK" value={logs.filter(l => l.type === 'success').length.toString()} color="#3fb950" />
        <StatItem label="Infos" value={logs.filter(l => l.type === 'info').length.toString()} color="#58a6ff" />
      </View>
    </SafeAreaView>
  );
}

function StatItem({ label, value, color = '#e6edf3' }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  title: { fontSize: 15, color: '#e6edf3', fontWeight: '800', letterSpacing: 2 },
  clearBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: '#2d1515', borderWidth: 1, borderColor: '#f85149',
  },
  clearText: { color: '#f85149', fontSize: 11, fontWeight: '700' },
  terminal: { flex: 1, margin: 14, borderRadius: 10, backgroundColor: '#010409', borderWidth: 1, borderColor: '#21262d', overflow: 'hidden' },
  terminalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#161b22', paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  terminalTitle: { color: '#8b949e', fontSize: 12, marginLeft: 8, fontFamily: 'monospace' },
  logList: { flex: 1, padding: 10 },
  emptyLog: { color: '#484f58', fontSize: 13, fontFamily: 'monospace', padding: 10, fontStyle: 'italic' },
  logRow: { flexDirection: 'row', marginBottom: 5, gap: 6, alignItems: 'flex-start' },
  logTime: { color: '#484f58', fontSize: 10, fontFamily: 'monospace', paddingTop: 1, minWidth: 60 },
  logPrefix: { fontSize: 10, fontFamily: 'monospace', fontWeight: '700', paddingTop: 1, minWidth: 40 },
  logMsg: { fontSize: 11, fontFamily: 'monospace', flex: 1, lineHeight: 16 },
  statsBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#161b22', borderTopWidth: 1, borderTopColor: '#21262d', paddingVertical: 12,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#8b949e', fontSize: 10, fontWeight: '600', letterSpacing: 1 },
});
