import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, StyleSheet, Animated, Easing, Platform,
} from 'react-native';
import {
  Shield, Globe, ChevronRight, Download, Upload,
  Activity, Clock, Zap, AlertCircle, CheckCircle2,
  Wifi, Radio,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useVpnStore } from '../store/useVpnStore';
import { C } from '../theme';

const PROTOCOLS = ['V2Ray/Xray', 'SSH', 'HTTP Inject', 'VLess', 'Shadowsocks'];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { status, activeConfig, currentServer, stats, connect, disconnect, logs } = useVpnStore();
  const [selectedProtocol, setSelectedProtocol] = useState(0);

  const isConnected = status === 'CONNECTED';
  const isConnecting = status === 'CONNECTING' || status === 'DISCONNECTING';
  const isError = status === 'ERROR';

  // ── Animations ──────────────────────────────────────────────
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isConnecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse1, { toValue: 1.35, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse1, { toValue: 1, duration: 900, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse2, { toValue: 1.6, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse2, { toValue: 1, duration: 1200, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse1.stopAnimation(); pulse1.setValue(1);
      pulse2.stopAnimation(); pulse2.setValue(1);
    }

    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.25, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      glowOpacity.stopAnimation(); glowOpacity.setValue(0);
    }
  }, [isConnected, isConnecting]);

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.93, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      connect(PROTOCOLS[selectedProtocol]);
    }
  };

  // ── Derived state ────────────────────────────────────────────
  const statusColor = isConnected ? C.green : isConnecting ? C.yellow : isError ? C.red : C.textDim;
  const statusBg = isConnected ? C.greenBg : isConnecting ? C.yellowBg : isError ? C.redBg : 'transparent';
  const statusText = isConnected ? 'CONNECTÉ' : isConnecting ? status === 'DISCONNECTING' ? 'DÉCONNEXION...' : 'CONNEXION...' : isError ? 'ERREUR' : 'DÉCONNECTÉ';
  const btnLabel = isConnected ? 'ARRÊTER' : isConnecting ? 'ANNULER' : 'DÉMARRER';
  const btnColor = isConnected ? C.red : isConnecting ? C.yellow : C.teal;
  const btnBg = isConnected ? 'rgba(239,68,68,0.15)' : isConnecting ? 'rgba(245,158,11,0.15)' : C.tealGlow;

  const lastLog = logs[logs.length - 1];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.teal} />

      {/* ── APP HEADER ──────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Shield size={20} color={C.white} strokeWidth={2.5} />
          <View style={styles.headerTitles}>
            <Text style={styles.headerAppName}>
              CLARK<Text style={styles.headerAppNameAccent}>VPN</Text>
            </Text>
            <Text style={styles.headerVersion}>v2.1.0 • HTTP Injector</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.headerBadge, { backgroundColor: statusBg, borderColor: statusColor }]}>
            <View style={[styles.headerDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.headerBadgeText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── PROTOCOL SELECTOR ───────────────────────── */}
        <View style={styles.protoSection}>
          <Text style={styles.sectionLabel}>TYPE DE TUNNEL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PROTOCOLS.map((p, i) => (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedProtocol(i)}
                style={[styles.protoChip, i === selectedProtocol && styles.protoChipActive]}
              >
                <Radio size={11} color={i === selectedProtocol ? C.tealLight : C.textDim} strokeWidth={2} />
                <Text style={[styles.protoText, i === selectedProtocol && styles.protoTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── CONNECT BUTTON AREA ─────────────────────── */}
        <View style={styles.connectArea}>
          {/* Pulse rings */}
          {isConnecting && (
            <>
              <Animated.View style={[styles.pulseRing, styles.pulseRing2, { transform: [{ scale: pulse2 }], borderColor: btnColor }]} />
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse1 }], borderColor: btnColor }]} />
            </>
          )}
          {isConnected && (
            <Animated.View style={[styles.glowCircle, { opacity: glowOpacity, backgroundColor: C.green }]} />
          )}

          {/* Main button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              onPress={handleToggle}
              activeOpacity={0.85}
              style={[styles.connectButton, { backgroundColor: btnBg, borderColor: btnColor }]}
            >
              <View style={[styles.connectInner, { borderColor: btnColor + '60' }]}>
                {isConnected ? (
                  <CheckCircle2 size={36} color={C.green} strokeWidth={2} />
                ) : isError ? (
                  <AlertCircle size={36} color={C.red} strokeWidth={2} />
                ) : (
                  <Shield size={36} color={isConnecting ? C.yellow : C.tealLight} strokeWidth={2} />
                )}
                <Text style={[styles.connectLabel, { color: isConnecting ? C.yellow : isConnected ? C.green : isError ? C.red : C.text }]}>
                  {btnLabel}
                </Text>
                {isConnected && (
                  <Text style={styles.connectDuration}>{stats.connectedTime}</Text>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ── ACTION ROW ──────────────────────────────── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.bigActionBtn}
            onPress={handleToggle}
            activeOpacity={0.8}
          >
            <View style={[styles.bigActionBtnInner, { backgroundColor: btnColor }]}>
              <Text style={styles.bigActionBtnText}>{btnLabel}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── SERVER CARD ─────────────────────────────── */}
        <TouchableOpacity
          style={styles.serverCard}
          onPress={() => navigation.navigate('ServerList')}
          activeOpacity={0.75}
        >
          <View style={styles.serverLeft}>
            <View style={styles.serverFlagBox}>
              <Globe size={22} color={C.tealLight} strokeWidth={1.8} />
            </View>
            <View style={styles.serverInfo}>
              <Text style={styles.serverLabel}>SERVEUR ACTIF</Text>
              <Text style={styles.serverName} numberOfLines={1}>
                {currentServer ? currentServer.name : 'Sélectionner un serveur'}
              </Text>
              {currentServer && (
                <View style={styles.serverMeta}>
                  <Wifi size={10} color={currentServer.ping < 80 ? C.green : C.yellow} />
                  <Text style={[styles.serverPing, { color: currentServer.ping < 80 ? C.green : C.yellow }]}>
                    {currentServer.ping}ms
                  </Text>
                  <Text style={styles.serverDot}>·</Text>
                  <Text style={styles.serverLoc}>{currentServer.location}</Text>
                </View>
              )}
            </View>
          </View>
          <ChevronRight size={20} color={C.tealLight} />
        </TouchableOpacity>

        {/* ── ACTIVE CONFIG ───────────────────────────── */}
        <View style={styles.configInfoCard}>
          <View style={styles.configInfoRow}>
            <Text style={styles.configInfoLabel}>CONFIGURATION</Text>
            <Text style={[styles.configInfoValue, { color: activeConfig ? C.tealLight : C.textDim }]} numberOfLines={1}>
              {activeConfig ? activeConfig.name : 'Aucune sélectionnée'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.configInfoRow}>
            <Text style={styles.configInfoLabel}>PROTOCOLE</Text>
            <Text style={styles.configInfoValue}>
              {activeConfig?.protocol ?? PROTOCOLS[selectedProtocol]}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.configInfoRow}>
            <Text style={styles.configInfoLabel}>TRANSPORT</Text>
            <Text style={styles.configInfoValue}>
              {activeConfig?.transport ?? 'WebSocket + TLS'}
            </Text>
          </View>
          {activeConfig?.sni ? (
            <>
              <View style={styles.divider} />
              <View style={styles.configInfoRow}>
                <Text style={styles.configInfoLabel}>SNI</Text>
                <Text style={styles.configInfoValue}>{activeConfig.sni}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* ── STATS ───────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Download size={16} color={C.tealLight} strokeWidth={2} />
            <Text style={styles.statValue}>{stats.downloadRate}</Text>
            <Text style={styles.statLabel}>TÉLÉCH.</Text>
          </View>
          <View style={styles.statCard}>
            <Upload size={16} color={C.green} strokeWidth={2} />
            <Text style={styles.statValue}>{stats.uploadRate}</Text>
            <Text style={styles.statLabel}>ENVOI</Text>
          </View>
          <View style={styles.statCard}>
            <Activity size={16} color={C.yellow} strokeWidth={2} />
            <Text style={styles.statValue}>{stats.ping}</Text>
            <Text style={styles.statLabel}>PING</Text>
          </View>
          <View style={styles.statCard}>
            <Zap size={16} color={C.textSub} strokeWidth={2} />
            <Text style={styles.statValue}>{stats.totalDataUsed}</Text>
            <Text style={styles.statLabel}>TOTAL</Text>
          </View>
        </View>

        {/* ── LAST LOG ────────────────────────────────── */}
        {lastLog && (
          <View style={styles.logPreview}>
            <View style={[styles.logDot, {
              backgroundColor:
                lastLog.type === 'error' ? C.red :
                lastLog.type === 'success' ? C.green :
                lastLog.type === 'warn' ? C.yellow : C.tealLight,
            }]} />
            <Text style={styles.logText} numberOfLines={2}>
              {lastLog.time}  {lastLog.message}
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const BTN_SIZE = 140;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    backgroundColor: C.teal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    elevation: 8,
    shadowColor: C.tealDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitles: { gap: 1 },
  headerAppName: { fontSize: 17, color: C.white, fontWeight: '900', letterSpacing: 1.5 },
  headerAppNameAccent: { color: 'rgba(255,255,255,0.75)' },
  headerVersion: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  headerRight: {},
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  headerDot: { width: 6, height: 6, borderRadius: 3 },
  headerBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // Protocol chips
  protoSection: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8 },
  sectionLabel: { fontSize: 10, color: C.textDim, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  protoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  protoChipActive: { backgroundColor: C.tealGlow, borderColor: C.teal },
  protoText: { color: C.textSub, fontWeight: '600', fontSize: 12 },
  protoTextActive: { color: C.tealLight, fontWeight: '700' },

  // Connect area
  connectArea: { alignItems: 'center', justifyContent: 'center', height: BTN_SIZE + 80, marginVertical: 4 },
  pulseRing: {
    position: 'absolute', width: BTN_SIZE + 20, height: BTN_SIZE + 20,
    borderRadius: (BTN_SIZE + 20) / 2, borderWidth: 1.5, opacity: 0.5,
  },
  pulseRing2: {
    width: BTN_SIZE + 44, height: BTN_SIZE + 44,
    borderRadius: (BTN_SIZE + 44) / 2, opacity: 0.25,
  },
  glowCircle: {
    position: 'absolute', width: BTN_SIZE + 60, height: BTN_SIZE + 60,
    borderRadius: (BTN_SIZE + 60) / 2, opacity: 0.15,
  },
  connectButton: {
    width: BTN_SIZE, height: BTN_SIZE, borderRadius: BTN_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, elevation: 12,
    shadowColor: C.teal, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6, shadowRadius: 12,
  },
  connectInner: {
    width: BTN_SIZE - 16, height: BTN_SIZE - 16,
    borderRadius: (BTN_SIZE - 16) / 2,
    alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1,
  },
  connectLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  connectDuration: { fontSize: 11, color: C.green, fontWeight: '700', letterSpacing: 1 },

  // Big action button
  actionRow: { paddingHorizontal: 16, marginBottom: 14 },
  bigActionBtn: { borderRadius: 14, overflow: 'hidden' },
  bigActionBtnInner: {
    paddingVertical: 16, borderRadius: 14, alignItems: 'center',
  },
  bigActionBtnText: { color: C.white, fontWeight: '900', fontSize: 15, letterSpacing: 2 },

  // Server card
  serverCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 14,
  },
  serverLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  serverFlagBox: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: C.tealGlow, borderWidth: 1, borderColor: C.teal,
    alignItems: 'center', justifyContent: 'center',
  },
  serverInfo: { flex: 1, gap: 2 },
  serverLabel: { fontSize: 9, color: C.textDim, fontWeight: '700', letterSpacing: 1.5 },
  serverName: { fontSize: 15, color: C.text, fontWeight: '800' },
  serverMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  serverPing: { fontSize: 11, fontWeight: '700' },
  serverDot: { color: C.textDim, fontSize: 10 },
  serverLoc: { fontSize: 11, color: C.textSub },

  // Config info
  configInfoCard: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  configInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 11,
  },
  configInfoLabel: { fontSize: 10, color: C.textDim, fontWeight: '700', letterSpacing: 1.5 },
  configInfoValue: { fontSize: 12, color: C.textSub, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },

  // Stats
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 10, gap: 8 },
  statCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 12,
    padding: 12, alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: C.border,
  },
  statValue: { color: C.text, fontSize: 11, fontWeight: '800' },
  statLabel: { color: C.textDim, fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },

  // Log preview
  logPreview: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginHorizontal: 16, backgroundColor: C.surface, borderRadius: 10,
    borderWidth: 1, borderColor: C.border, padding: 10,
  },
  logDot: { width: 7, height: 7, borderRadius: 4, marginTop: 3, flexShrink: 0 },
  logText: { color: C.textSub, fontSize: 11, fontFamily: 'monospace', flex: 1, lineHeight: 16 },
});
