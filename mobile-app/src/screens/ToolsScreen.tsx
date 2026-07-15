import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, StyleSheet, TextInput, ActivityIndicator,
} from 'react-native';
import { Wrench, Globe, Signal, Search, Wifi, MapPin, Clock, CheckCircle } from 'lucide-react-native';
import { C } from '../theme';

const DNS_PRESETS = [
  { name: 'Cloudflare',    primary: '1.1.1.1',       secondary: '1.0.0.1',   emoji: '🟠' },
  { name: 'Google',        primary: '8.8.8.8',       secondary: '8.8.4.4',   emoji: '🔵' },
  { name: 'OpenDNS',       primary: '208.67.222.222', secondary: '208.67.220.220', emoji: '🟣' },
  { name: 'Quad9',         primary: '9.9.9.9',       secondary: '149.112.112.112', emoji: '🟡' },
  { name: 'AdGuard',       primary: '94.140.14.14',  secondary: '94.140.15.15',   emoji: '🟢' },
];

function simulatePing(host: string): Promise<number> {
  return new Promise(resolve => setTimeout(() => resolve(Math.floor(Math.random() * 150) + 8), 800 + Math.random() * 600));
}

function simulateDnsLookup(host: string): Promise<string[]> {
  return new Promise(resolve =>
    setTimeout(() => resolve([
      `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
      `2606:4700:${Math.floor(Math.random() * 9000) + 1000}::${Math.floor(Math.random() * 9000) + 1000}`,
    ]), 600 + Math.random() * 800)
  );
}

function simulateIpCheck(): Promise<{ ip: string; country: string; isp: string; org: string }> {
  return new Promise(resolve =>
    setTimeout(() => resolve({
      ip: `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`,
      country: 'France 🇫🇷',
      isp: 'Orange SA',
      org: 'AS3215 Orange',
    }), 1000)
  );
}

export default function ToolsScreen() {
  const [selectedDns, setSelectedDns] = useState(0);
  const [pingHost, setPingHost] = useState('google.com');
  const [pingResult, setPingResult] = useState<number | null>(null);
  const [pingLoading, setPingLoading] = useState(false);

  const [dnsHost, setDnsHost] = useState('google.com');
  const [dnsResult, setDnsResult] = useState<string[] | null>(null);
  const [dnsLoading, setDnsLoading] = useState(false);

  const [ipData, setIpData] = useState<{ ip: string; country: string; isp: string; org: string } | null>(null);
  const [ipLoading, setIpLoading] = useState(false);

  const doPing = async () => {
    setPingLoading(true); setPingResult(null);
    const ms = await simulatePing(pingHost);
    setPingResult(ms); setPingLoading(false);
  };

  const doDns = async () => {
    setDnsLoading(true); setDnsResult(null);
    const res = await simulateDnsLookup(dnsHost);
    setDnsResult(res); setDnsLoading(false);
  };

  const doIpCheck = async () => {
    setIpLoading(true); setIpData(null);
    const res = await simulateIpCheck();
    setIpData(res); setIpLoading(false);
  };

  const pingColor = pingResult !== null
    ? pingResult < 60 ? C.green : pingResult < 120 ? C.yellow : C.red
    : C.text;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.teal} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Outils Réseau</Text>
          <Text style={styles.headerSub}>Diagnostic & analyse</Text>
        </View>
        <Wrench size={22} color="rgba(255,255,255,0.7)" strokeWidth={2} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14 }}>

        {/* ── VÉRIFIER IP ─────────────────────────────── */}
        <Section title="VÉRIFICATION IP" Icon={Globe}>
          <TouchableOpacity style={styles.actionBtn} onPress={doIpCheck} disabled={ipLoading} activeOpacity={0.8}>
            {ipLoading ? (
              <ActivityIndicator color={C.white} size="small" />
            ) : (
              <>
                <Search size={15} color={C.white} strokeWidth={2.5} />
                <Text style={styles.actionBtnText}>Vérifier mon IP</Text>
              </>
            )}
          </TouchableOpacity>
          {ipData && (
            <View style={styles.resultGrid}>
              <ResultRow label="Adresse IP" value={ipData.ip} mono />
              <ResultRow label="Pays" value={ipData.country} />
              <ResultRow label="FAI" value={ipData.isp} />
              <ResultRow label="Organisation" value={ipData.org} mono />
            </View>
          )}
        </Section>

        {/* ── PING ────────────────────────────────────── */}
        <Section title="PING" Icon={Signal}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={pingHost}
              onChangeText={setPingHost}
              placeholder="Hôte cible"
              placeholderTextColor={C.textDim}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.runBtn} onPress={doPing} disabled={pingLoading} activeOpacity={0.8}>
              {pingLoading
                ? <ActivityIndicator color={C.white} size="small" />
                : <Signal size={16} color={C.white} strokeWidth={2.5} />
              }
            </TouchableOpacity>
          </View>
          {pingResult !== null && (
            <View style={[styles.pingResult, { borderColor: pingColor + '50' }]}>
              <Signal size={18} color={pingColor} strokeWidth={2} />
              <Text style={[styles.pingValue, { color: pingColor }]}>{pingResult} ms</Text>
              <Text style={[styles.pingLabel, { color: pingColor }]}>
                {pingResult < 60 ? '● Excellent' : pingResult < 120 ? '● Bon' : '● Mauvais'}
              </Text>
            </View>
          )}
        </Section>

        {/* ── DNS LOOKUP ──────────────────────────────── */}
        <Section title="DNS LOOKUP" Icon={Search}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={dnsHost}
              onChangeText={setDnsHost}
              placeholder="Domaine à résoudre"
              placeholderTextColor={C.textDim}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.runBtn} onPress={doDns} disabled={dnsLoading} activeOpacity={0.8}>
              {dnsLoading
                ? <ActivityIndicator color={C.white} size="small" />
                : <Search size={16} color={C.white} strokeWidth={2.5} />
              }
            </TouchableOpacity>
          </View>
          {dnsResult && (
            <View style={styles.resultGrid}>
              {dnsResult.map((r, i) => (
                <ResultRow key={i} label={i === 0 ? 'IPv4' : 'IPv6'} value={r} mono />
              ))}
            </View>
          )}
        </Section>

        {/* ── DNS SERVER ──────────────────────────────── */}
        <Section title="SERVEUR DNS" Icon={Wifi}>
          {DNS_PRESETS.map((dns, i) => (
            <TouchableOpacity
              key={dns.name}
              onPress={() => setSelectedDns(i)}
              style={[styles.dnsRow, i === selectedDns && styles.dnsRowActive]}
              activeOpacity={0.75}
            >
              <View style={[styles.dnsRadio, i === selectedDns && styles.dnsRadioActive]}>
                {i === selectedDns && <View style={styles.dnsRadioDot} />}
              </View>
              <Text style={styles.dnsEmoji}>{dns.emoji}</Text>
              <View style={styles.dnsInfo}>
                <Text style={[styles.dnsName, i === selectedDns && styles.dnsNameActive]}>{dns.name}</Text>
                <Text style={styles.dnsAddr}>{dns.primary}  ·  {dns.secondary}</Text>
              </View>
              {i === selectedDns && <CheckCircle size={16} color={C.tealLight} strokeWidth={2} />}
            </TouchableOpacity>
          ))}
        </Section>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, Icon, children }: { title: string; Icon: any; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.header}>
        <Icon size={14} color={C.tealLight} strokeWidth={2.5} />
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}
const sectionStyles = StyleSheet.create({
  container: { marginBottom: 14, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  title: { fontSize: 11, color: C.tealLight, fontWeight: '800', letterSpacing: 1.5 },
  body: { padding: 14 },
});

function ResultRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={rrStyles.row}>
      <Text style={rrStyles.label}>{label}</Text>
      <Text style={[rrStyles.value, mono && rrStyles.mono]} selectable>{value}</Text>
    </View>
  );
}
const rrStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  label: { fontSize: 11, color: C.textDim, fontWeight: '600' },
  value: { fontSize: 12, color: C.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 11 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: C.teal,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTitle: { fontSize: 16, color: C.white, fontWeight: '800' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  scroll: { flex: 1 },

  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, color: C.text, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13,
  },
  runBtn: {
    backgroundColor: C.teal, borderRadius: 10, paddingHorizontal: 16,
    alignItems: 'center', justifyContent: 'center', minWidth: 48,
  },
  actionBtn: {
    backgroundColor: C.teal, borderRadius: 10, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  actionBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },
  pingResult: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 10, backgroundColor: C.bg, borderRadius: 10,
    borderWidth: 1, padding: 12,
  },
  pingValue: { fontSize: 22, fontWeight: '900' },
  pingLabel: { fontSize: 12, fontWeight: '700' },
  resultGrid: {
    backgroundColor: C.bg, borderRadius: 10, marginTop: 10,
    borderWidth: 1, borderColor: C.border, paddingHorizontal: 12,
  },

  dnsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, marginBottom: 4,
  },
  dnsRowActive: { backgroundColor: C.tealGlow },
  dnsRadio: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2,
    borderColor: C.border2, alignItems: 'center', justifyContent: 'center',
  },
  dnsRadioActive: { borderColor: C.tealLight },
  dnsRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.tealLight },
  dnsEmoji: { fontSize: 16 },
  dnsInfo: { flex: 1 },
  dnsName: { fontSize: 13, color: C.text, fontWeight: '700' },
  dnsNameActive: { color: C.tealLight },
  dnsAddr: { fontSize: 10, color: C.textDim, fontFamily: 'monospace', marginTop: 1 },
});
