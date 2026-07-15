import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { useVpnStore } from '../store/useVpnStore';

const { width } = Dimensions.get('window');

const PROTOCOLS = ['SSH', 'V2Ray', 'VLess', 'HTTP Inject', 'Shadowsocks'];

export default function HomeScreen() {
  const { status, activeConfig, stats, connect, disconnect, logs } = useVpnStore();
  const [selectedProtocol, setSelectedProtocol] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isConnected = status === 'CONNECTED';
  const isConnecting = status === 'CONNECTING';

  // Pulse animation for the connect button
  useEffect(() => {
    if (isConnecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isConnecting]);

  const handleToggle = () => {
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      connect(PROTOCOLS[selectedProtocol]);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getStatusColor = () => {
    if (isConnected) return '#3fb950';
    if (isConnecting) return '#d29922';
    if (status === 'ERROR') return '#f85149';
    return '#8b949e';
  };

  const getStatusText = () => {
    if (isConnected) return 'CONNECTÉ';
    if (isConnecting) return 'CONNEXION...';
    if (status === 'ERROR') return 'ERREUR';
    return 'DÉCONNECTÉ';
  };

  const getButtonLabel = () => {
    if (isConnected) return 'ARRÊTER';
    if (isConnecting) return 'ANNULER';
    return 'DÉMARRER';
  };

  const lastLogs = logs.slice(-3).reverse();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>CLARK <Text style={styles.logoAccent}>VPN</Text></Text>
        <View style={[styles.statusBadge, { borderColor: getStatusColor() }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* Protocol Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TYPE DE TUNNEL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.protocolScroll}>
            {PROTOCOLS.map((p, i) => (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedProtocol(i)}
                style={[styles.protocolChip, i === selectedProtocol && styles.protocolChipActive]}
              >
                <Text style={[styles.protocolText, i === selectedProtocol && styles.protocolTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Config Info */}
        <View style={styles.configCard}>
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>CONFIGURATION</Text>
            <Text style={[styles.configValue, { color: activeConfig ? '#3fb950' : '#f85149' }]}>
              {activeConfig ? activeConfig.name : 'Aucune config'}
            </Text>
          </View>
          <View style={styles.configDivider} />
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>SERVEUR</Text>
            <Text style={styles.configValue}>
              {activeConfig ? `${activeConfig.host}:${activeConfig.port}` : '--'}
            </Text>
          </View>
          <View style={styles.configDivider} />
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>DNS</Text>
            <Text style={styles.configValue}>1.1.1.1 (Cloudflare)</Text>
          </View>
        </View>

        {/* Big Connect Button */}
        <View style={styles.connectArea}>
          <Animated.View style={[styles.buttonOuter, { transform: [{ scale: pulseAnim }] }]}>
            <Animated.View style={[
              styles.buttonRing,
              { borderColor: getStatusColor(), transform: isConnecting ? [{ rotate: spin }] : [] }
            ]} />
            <TouchableOpacity
              onPress={handleToggle}
              style={[styles.connectButton, { backgroundColor: isConnected ? '#1a3a1a' : '#0d2a3a' }]}
              activeOpacity={0.85}
            >
              <Text style={styles.connectIcon}>{isConnected ? '⬛' : '▶'}</Text>
              <Text style={[styles.connectLabel, { color: getStatusColor() }]}>{getButtonLabel()}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⬇️</Text>
            <Text style={styles.statValue}>{stats.downloadRate}</Text>
            <Text style={styles.statLabel}>DOWNLOAD</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⬆️</Text>
            <Text style={styles.statValue}>{stats.uploadRate}</Text>
            <Text style={styles.statLabel}>UPLOAD</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📡</Text>
            <Text style={styles.statValue}>{stats.ping}</Text>
            <Text style={styles.statLabel}>PING</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>{stats.connectedTime}</Text>
            <Text style={styles.statLabel}>DURÉE</Text>
          </View>
        </View>

        {/* Live Log Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>JOURNAL (APERÇU)</Text>
          <View style={styles.logPreview}>
            {lastLogs.length === 0 ? (
              <Text style={styles.logEmpty}>Aucun évènement pour l'instant...</Text>
            ) : (
              lastLogs.map((log, i) => (
                <Text key={i} style={[styles.logLine, { color: log.type === 'error' ? '#f85149' : log.type === 'success' ? '#3fb950' : '#58a6ff' }]}>
                  [{log.time}] {log.message}
                </Text>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  logoText: { fontSize: 22, fontWeight: '900', color: '#e6edf3', letterSpacing: 3 },
  logoAccent: { color: '#58a6ff' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  scroll: { flex: 1 },
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionLabel: { fontSize: 11, color: '#8b949e', fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  protocolScroll: { flexDirection: 'row' },
  protocolChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d',
  },
  protocolChipActive: { backgroundColor: '#1f3a5f', borderColor: '#58a6ff' },
  protocolText: { color: '#8b949e', fontWeight: '600', fontSize: 13 },
  protocolTextActive: { color: '#58a6ff' },
  configCard: {
    margin: 16, backgroundColor: '#161b22', borderRadius: 12,
    borderWidth: 1, borderColor: '#21262d', overflow: 'hidden',
  },
  configRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
  },
  configDivider: { height: 1, backgroundColor: '#21262d', marginHorizontal: 16 },
  configLabel: { fontSize: 11, color: '#8b949e', fontWeight: '700', letterSpacing: 1.5 },
  configValue: { fontSize: 13, color: '#e6edf3', fontWeight: '600' },
  connectArea: { alignItems: 'center', marginVertical: 28 },
  buttonOuter: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  buttonRing: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    borderWidth: 2, borderStyle: 'dashed',
  },
  connectButton: {
    width: 134, height: 134, borderRadius: 67,
    alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 2, borderColor: '#30363d',
  },
  connectIcon: { fontSize: 32 },
  connectLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 12, gap: 8,
  },
  statCard: {
    flex: 1, backgroundColor: '#161b22', borderRadius: 10,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#21262d',
  },
  statIcon: { fontSize: 16, marginBottom: 4 },
  statValue: { color: '#e6edf3', fontSize: 11, fontWeight: '700' },
  statLabel: { color: '#8b949e', fontSize: 9, fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  logPreview: {
    backgroundColor: '#0d1117', borderRadius: 8, padding: 12,
    borderWidth: 1, borderColor: '#21262d', minHeight: 60,
  },
  logLine: { fontSize: 11, fontFamily: 'monospace', marginBottom: 4, lineHeight: 16 },
  logEmpty: { color: '#484f58', fontSize: 12, fontStyle: 'italic' },
});
