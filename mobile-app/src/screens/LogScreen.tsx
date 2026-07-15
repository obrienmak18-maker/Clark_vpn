import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  FlatList, StyleSheet,
} from 'react-native';
import { Trash2, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react-native';
import { useVpnStore } from '../store/useVpnStore';
import { C } from '../theme';

const LOG_CONFIG = {
  error:   { color: C.red,       label: '[ERR]', bg: 'rgba(239,68,68,0.08)',   Icon: AlertCircle },
  success: { color: C.green,     label: '[OK] ', bg: 'rgba(0,200,150,0.08)',   Icon: CheckCircle },
  warn:    { color: C.yellow,    label: '[WRN]', bg: 'rgba(245,158,11,0.08)',  Icon: AlertTriangle },
  info:    { color: C.tealLight, label: '[INF]', bg: 'rgba(77,208,225,0.08)',  Icon: Info },
};

export default function LogScreen() {
  const { logs, clearLogs } = useVpnStore();
  const flatRef = useRef<FlatList>(null);

  const errCount = logs.filter(l => l.type === 'error').length;
  const okCount  = logs.filter(l => l.type === 'success').length;
  const wrnCount = logs.filter(l => l.type === 'warn').length;
  const infCount = logs.filter(l => l.type === 'info').length;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.teal} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Journal de connexion</Text>
          <Text style={styles.headerSub}>{logs.length} entrée(s)</Text>
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={clearLogs} disabled={logs.length === 0}>
          <Trash2 size={15} color={logs.length > 0 ? C.red : C.textDim} strokeWidth={2} />
          <Text style={[styles.clearText, { color: logs.length > 0 ? C.red : C.textDim }]}>EFFACER</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <StatChip label="TOTAL" value={logs.length} color={C.textSub} />
        <View style={styles.statsDivider} />
        <StatChip label="ERREURS" value={errCount} color={C.red} />
        <View style={styles.statsDivider} />
        <StatChip label="OK" value={okCount} color={C.green} />
        <View style={styles.statsDivider} />
        <StatChip label="AVERT." value={wrnCount} color={C.yellow} />
        <View style={styles.statsDivider} />
        <StatChip label="INFO" value={infCount} color={C.tealLight} />
      </View>

      {/* Terminal */}
      <View style={styles.terminal}>
        {/* Terminal titlebar */}
        <View style={styles.termBar}>
          <View style={styles.termDots}>
            <View style={[styles.termDot, { backgroundColor: C.red }]} />
            <View style={[styles.termDot, { backgroundColor: C.yellow }]} />
            <View style={[styles.termDot, { backgroundColor: C.green }]} />
          </View>
          <Text style={styles.termTitle}>clark-vpn  ●  /var/log/vpn.log</Text>
        </View>

        <FlatList
          ref={flatRef}
          data={[...logs].reverse()}
          keyExtractor={(_, i) => i.toString()}
          style={styles.logList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 10 }}
          ListEmptyComponent={
            <View style={styles.emptyLog}>
              <Text style={styles.emptyLogText}>
                {'>'} En attente d'événements VPN...{'\n'}
                {'>'} Appuyez sur "DÉMARRER" depuis l'écran principal.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const cfg = LOG_CONFIG[item.type as keyof typeof LOG_CONFIG] ?? LOG_CONFIG.info;
            return (
              <View style={[styles.logRow, { backgroundColor: cfg.bg }]}>
                <Text style={styles.logTime}>{item.time}</Text>
                <Text style={[styles.logLabel, { color: cfg.color }]}>{cfg.label}</Text>
                <Text style={[styles.logMsg, { color: cfg.color }]} numberOfLines={3}>
                  {item.message}
                </Text>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.teal,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTitle: { fontSize: 16, color: C.white, fontWeight: '800' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  clearText: { fontWeight: '700', fontSize: 11, letterSpacing: 0.5 },

  statsBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
    paddingVertical: 10, paddingHorizontal: 16,
  },
  statChip: { flex: 1, alignItems: 'center', gap: 1 },
  statValue: { fontSize: 15, fontWeight: '900' },
  statLabel: { fontSize: 8, color: C.textDim, fontWeight: '700', letterSpacing: 0.8 },
  statsDivider: { width: 1, height: 28, backgroundColor: C.border },

  terminal: {
    flex: 1, margin: 12, borderRadius: 12,
    backgroundColor: '#050810', borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  termBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: C.border, gap: 12,
    backgroundColor: C.surface,
  },
  termDots: { flexDirection: 'row', gap: 6 },
  termDot: { width: 10, height: 10, borderRadius: 5 },
  termTitle: { color: C.textDim, fontSize: 11, fontFamily: 'monospace' },

  logList: { flex: 1 },
  emptyLog: { padding: 14 },
  emptyLogText: { color: C.textDim, fontSize: 12, fontFamily: 'monospace', lineHeight: 20 },

  logRow: {
    flexDirection: 'row', gap: 6, paddingVertical: 5, paddingHorizontal: 6,
    borderRadius: 6, marginVertical: 1,
  },
  logTime: { color: C.textDim, fontSize: 10, fontFamily: 'monospace', flexShrink: 0, marginTop: 1 },
  logLabel: { fontSize: 10, fontFamily: 'monospace', fontWeight: '900', flexShrink: 0, marginTop: 1 },
  logMsg: { fontSize: 11, fontFamily: 'monospace', flex: 1, lineHeight: 17 },
});
