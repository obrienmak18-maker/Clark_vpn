import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, StyleSheet, TextInput, Alert,
} from 'react-native';

const DNS_PRESETS = [
  { name: 'Cloudflare', primary: '1.1.1.1', secondary: '1.0.0.1' },
  { name: 'Google', primary: '8.8.8.8', secondary: '8.8.4.4' },
  { name: 'OpenDNS', primary: '208.67.222.222', secondary: '208.67.220.220' },
  { name: 'Quad9', primary: '9.9.9.9', secondary: '149.112.112.112' },
];

export default function ToolsScreen() {
  const [pingHost, setPingHost] = useState('1.1.1.1');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [dnsHost, setDnsHost] = useState('');
  const [dnsResult, setDnsResult] = useState<string | null>(null);
  const [selectedDns, setSelectedDns] = useState(0);

  const handlePing = async () => {
    setPingResult('En cours...');
    // Simulation d'un ping (remplacer par appel natif réel)
    await new Promise(r => setTimeout(r, 800));
    const ms = Math.floor(Math.random() * 120) + 8;
    setPingResult(`Réponse de ${pingHost}: délai=${ms}ms TTL=64\nRéponse de ${pingHost}: délai=${ms + 2}ms TTL=64\nRéponse de ${pingHost}: délai=${ms + 1}ms TTL=64`);
  };

  const handleDnsLookup = async () => {
    if (!dnsHost) { Alert.alert('', 'Entrez un nom de domaine.'); return; }
    setDnsResult('Résolution en cours...');
    await new Promise(r => setTimeout(r, 600));
    setDnsResult(`${dnsHost} → 104.21.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}\nTTL: 300s\nType: A`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <View style={styles.header}>
        <Text style={styles.title}>OUTILS RÉSEAU</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* DNS Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐  SERVEUR DNS</Text>
          {DNS_PRESETS.map((dns, i) => (
            <TouchableOpacity
              key={dns.name}
              style={[styles.dnsRow, i === selectedDns && styles.dnsRowActive]}
              onPress={() => setSelectedDns(i)}
            >
              <View style={[styles.radio, i === selectedDns && styles.radioActive]}>
                {i === selectedDns && <View style={styles.radioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dnsName}>{dns.name}</Text>
                <Text style={styles.dnsAddr}>{dns.primary} / {dns.secondary}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ping Tool */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📡  PING</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={pingHost}
              onChangeText={setPingHost}
              placeholder="Hôte ou IP"
              placeholderTextColor="#484f58"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.actionBtn} onPress={handlePing}>
              <Text style={styles.actionBtnText}>GO</Text>
            </TouchableOpacity>
          </View>
          {pingResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{pingResult}</Text>
            </View>
          )}
        </View>

        {/* DNS Lookup */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔍  DNS LOOKUP</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={dnsHost}
              onChangeText={setDnsHost}
              placeholder="exemple.com"
              placeholderTextColor="#484f58"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.actionBtn} onPress={handleDnsLookup}>
              <Text style={styles.actionBtnText}>GO</Text>
            </TouchableOpacity>
          </View>
          {dnsResult && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{dnsResult}</Text>
            </View>
          )}
        </View>

        {/* IP Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🆔  VOTRE IP PUBLIQUE</Text>
          <TouchableOpacity style={styles.checkIpBtn} onPress={() => Alert.alert('IP publique', 'Fonctionnalité disponible lorsque connecté à un serveur VPN.')}>
            <Text style={styles.checkIpText}>Vérifier mon IP</Text>
          </TouchableOpacity>
          <View style={styles.ipRow}>
            <View style={styles.ipItem}>
              <Text style={styles.ipLabel}>IP RÉELLE</Text>
              <Text style={styles.ipValue}>---.---.---.---</Text>
            </View>
            <View style={styles.ipDivider} />
            <View style={styles.ipItem}>
              <Text style={styles.ipLabel}>IP VPN</Text>
              <Text style={[styles.ipValue, { color: '#3fb950' }]}>---.---.---.---</Text>
            </View>
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
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  title: { fontSize: 15, color: '#e6edf3', fontWeight: '800', letterSpacing: 2 },
  scroll: { flex: 1 },
  card: {
    margin: 14, marginBottom: 0, backgroundColor: '#161b22',
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#21262d',
  },
  cardTitle: { color: '#e6edf3', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 14 },
  dnsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderRadius: 8, paddingHorizontal: 4,
  },
  dnsRowActive: { backgroundColor: '#0d2040' },
  radio: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2,
    borderColor: '#30363d', alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#58a6ff' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#58a6ff' },
  dnsName: { color: '#e6edf3', fontWeight: '700', fontSize: 13 },
  dnsAddr: { color: '#8b949e', fontSize: 11, fontFamily: 'monospace' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#30363d',
    borderRadius: 8, color: '#e6edf3', paddingHorizontal: 12, paddingVertical: 10, fontSize: 13,
  },
  actionBtn: {
    backgroundColor: '#1f3a5f', borderWidth: 1, borderColor: '#58a6ff',
    borderRadius: 8, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnText: { color: '#58a6ff', fontWeight: '800', fontSize: 13 },
  resultBox: {
    backgroundColor: '#010409', borderRadius: 8, padding: 10,
    marginTop: 10, borderWidth: 1, borderColor: '#21262d',
  },
  resultText: { color: '#3fb950', fontFamily: 'monospace', fontSize: 11, lineHeight: 18 },
  checkIpBtn: {
    backgroundColor: '#0d2040', borderWidth: 1, borderColor: '#58a6ff',
    borderRadius: 8, padding: 10, alignItems: 'center', marginBottom: 12,
  },
  checkIpText: { color: '#58a6ff', fontWeight: '700', fontSize: 13 },
  ipRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  ipItem: { alignItems: 'center', gap: 4 },
  ipLabel: { color: '#8b949e', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  ipValue: { color: '#e6edf3', fontSize: 14, fontFamily: 'monospace', fontWeight: '700' },
  ipDivider: { width: 1, height: 30, backgroundColor: '#21262d' },
});
