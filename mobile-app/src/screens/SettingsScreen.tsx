import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, StyleSheet, Switch, Alert,
} from 'react-native';

export default function SettingsScreen() {
  const [killSwitch, setKillSwitch] = useState(false);
  const [splitTunnel, setSplitTunnel] = useState(false);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [obfuscation, setObfuscation] = useState(false);
  const [bypassLan, setBypassLan] = useState(true);
  const [startOnBoot, setStartOnBoot] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <View style={styles.header}>
        <Text style={styles.title}>PARAMÈTRES</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        <SectionHeader label="🔒  SÉCURITÉ" />
        <SettingRow label="Kill Switch" sub="Coupe le réseau si le VPN se déconnecte" value={killSwitch} onChange={setKillSwitch} />
        <SettingRow label="Obfuscation" sub="Masque le trafic VPN (résistant aux DPI)" value={obfuscation} onChange={setObfuscation} />

        <SectionHeader label="🌐  RÉSEAU" />
        <SettingRow label="Auto-reconnexion" sub="Se reconnecte automatiquement en cas de coupure" value={autoReconnect} onChange={setAutoReconnect} />
        <SettingRow label="Bypasser LAN" sub="Exclure le réseau local du tunnel VPN" value={bypassLan} onChange={setBypassLan} />
        <SettingRow label="Split Tunneling" sub="Choisir quelles apps utilisent le VPN" value={splitTunnel} onChange={setSplitTunnel} />
        <SettingRow label="Démarrer au boot" sub="Lance le VPN automatiquement au démarrage" value={startOnBoot} onChange={setStartOnBoot} />

        <SectionHeader label="ℹ️  À PROPOS" />

        <View style={styles.card}>
          <InfoRow label="Application" value="Clark VPN" />
          <InfoRow label="Version" value="1.0.0 (Build 1)" />
          <InfoRow label="Protocoles" value="V2Ray, VLess, SSH, HTTP Inject" />
          <InfoRow label="Build" value="Release" last />
        </View>

        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={() => Alert.alert('Réinitialiser', 'Toutes les configurations seront supprimées.', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réinitialiser', style: 'destructive', onPress: () => {} },
          ])}
        >
          <Text style={styles.dangerText}>⚠️  Réinitialiser l'application</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Clark VPN © 2025 • Toute utilisation est sous votre responsabilité</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

function SettingRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#30363d', true: '#1f3a5f' }}
        thumbColor={value ? '#58a6ff' : '#8b949e'}
      />
    </View>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {!last && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  header: {
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  title: { fontSize: 15, color: '#e6edf3', fontWeight: '800', letterSpacing: 2 },
  scroll: { flex: 1 },
  sectionHeader: {
    color: '#8b949e', fontSize: 11, fontWeight: '700', letterSpacing: 2,
    marginHorizontal: 16, marginTop: 22, marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#161b22', borderWidth: 1, borderColor: '#21262d',
    marginHorizontal: 14, marginBottom: 1, padding: 14, borderRadius: 0,
  },
  settingLeft: { flex: 1, marginRight: 12 },
  settingLabel: { color: '#e6edf3', fontSize: 14, fontWeight: '600' },
  settingSub: { color: '#8b949e', fontSize: 11, marginTop: 2 },
  card: {
    marginHorizontal: 14, backgroundColor: '#161b22',
    borderRadius: 12, borderWidth: 1, borderColor: '#21262d', overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  infoLabel: { color: '#8b949e', fontSize: 13 },
  infoValue: { color: '#e6edf3', fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#21262d', marginHorizontal: 16 },
  dangerBtn: {
    marginHorizontal: 14, marginTop: 20,
    backgroundColor: '#2d1515', borderWidth: 1, borderColor: '#f85149',
    borderRadius: 10, padding: 14, alignItems: 'center',
  },
  dangerText: { color: '#f85149', fontWeight: '700', fontSize: 14 },
  footer: { alignItems: 'center', marginTop: 24, paddingHorizontal: 30 },
  footerText: { color: '#484f58', fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
