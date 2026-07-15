import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, StyleSheet, Switch,
} from 'react-native';
import {
  SlidersHorizontal, Shield, Wifi, RefreshCw, Network, Globe,
  Lock, Bell, Info, ChevronRight, Moon, Zap, Eye,
} from 'lucide-react-native';
import { C } from '../theme';

interface ToggleItem {
  key: string;
  label: string;
  sub: string;
  icon: any;
  iconColor: string;
}

export default function SettingsScreen() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    killSwitch: true,
    obfuscation: false,
    autoReconnect: true,
    splitTunnel: false,
    lanBypass: true,
    ipv6Leak: false,
    dnsLeak: true,
    notifications: true,
  });

  const toggle = (key: string) => setToggles(p => ({ ...p, [key]: !p[key] }));

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.teal} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSub}>Configuration avancée</Text>
        </View>
        <SlidersHorizontal size={22} color="rgba(255,255,255,0.7)" strokeWidth={2} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14 }}>

        {/* ── SÉCURITÉ ────────────────────────────────── */}
        <SectionHeader title="SÉCURITÉ" Icon={Shield} />
        <View style={styles.card}>
          <ToggleRow
            icon={<Shield size={16} color="#EF4444" strokeWidth={2} />}
            label="Kill Switch"
            sub="Coupe internet si VPN se déconnecte"
            value={toggles.killSwitch}
            onToggle={() => toggle('killSwitch')}
          />
          <Divider />
          <ToggleRow
            icon={<Eye size={16} color="#8B5CF6" strokeWidth={2} />}
            label="Obfuscation"
            sub="Masque le trafic VPN (bypass DPI)"
            value={toggles.obfuscation}
            onToggle={() => toggle('obfuscation')}
          />
          <Divider />
          <ToggleRow
            icon={<Lock size={16} color={C.yellow} strokeWidth={2} />}
            label="Protection fuite DNS"
            sub="Empêche les fuites DNS"
            value={toggles.dnsLeak}
            onToggle={() => toggle('dnsLeak')}
          />
          <Divider />
          <ToggleRow
            icon={<Globe size={16} color={C.tealLight} strokeWidth={2} />}
            label="Bloquer IPv6"
            sub="Prévention des fuites IPv6"
            value={toggles.ipv6Leak}
            onToggle={() => toggle('ipv6Leak')}
          />
        </View>

        {/* ── CONNEXION ───────────────────────────────── */}
        <SectionHeader title="CONNEXION" Icon={Wifi} />
        <View style={styles.card}>
          <ToggleRow
            icon={<RefreshCw size={16} color={C.green} strokeWidth={2} />}
            label="Reconnexion auto"
            sub="Reconnecte si connexion perdue"
            value={toggles.autoReconnect}
            onToggle={() => toggle('autoReconnect')}
          />
          <Divider />
          <ToggleRow
            icon={<Network size={16} color={C.tealLight} strokeWidth={2} />}
            label="Split Tunneling"
            sub="Choisir apps utilisant le VPN"
            value={toggles.splitTunnel}
            onToggle={() => toggle('splitTunnel')}
          />
          <Divider />
          <ToggleRow
            icon={<Wifi size={16} color="#F59E0B" strokeWidth={2} />}
            label="Bypass LAN"
            sub="Accès réseau local sans VPN"
            value={toggles.lanBypass}
            onToggle={() => toggle('lanBypass')}
          />
        </View>

        {/* ── NOTIFICATIONS ───────────────────────────── */}
        <SectionHeader title="NOTIFICATIONS" Icon={Bell} />
        <View style={styles.card}>
          <ToggleRow
            icon={<Bell size={16} color={C.tealLight} strokeWidth={2} />}
            label="Notifications VPN"
            sub="Alertes connexion / déconnexion"
            value={toggles.notifications}
            onToggle={() => toggle('notifications')}
          />
        </View>

        {/* ── INFOS ───────────────────────────────────── */}
        <SectionHeader title="À PROPOS" Icon={Info} />
        <View style={styles.card}>
          <InfoRow label="Application" value="Clark VPN" />
          <Divider />
          <InfoRow label="Version" value="2.1.0 (build 42)" />
          <Divider />
          <InfoRow label="Protocoles" value="V2Ray · SSH · VLess · HTTP" />
          <Divider />
          <InfoRow label="Chiffrement" value="AES-256-GCM" />
          <Divider />
          <InfoRow label="Développeur" value="Clark Team" />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, Icon }: { title: string; Icon: any }) {
  return (
    <View style={styles.sectionHeader}>
      <Icon size={13} color={C.tealLight} strokeWidth={2.5} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ToggleRow({
  icon, label, sub, value, onToggle,
}: { icon: React.ReactNode; label: string; sub: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleIcon}>{icon}</View>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: C.border, true: C.tealDark }}
        thumbColor={value ? C.tealLight : C.textDim}
        ios_backgroundColor={C.border}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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

  scroll: { flex: 1 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 6, paddingBottom: 8, paddingTop: 14,
  },
  sectionTitle: { fontSize: 11, color: C.tealLight, fontWeight: '800', letterSpacing: 1.5 },

  card: {
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, marginBottom: 4, overflow: 'hidden',
  },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12, gap: 12,
  },
  toggleIcon: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: 14, color: C.text, fontWeight: '700' },
  toggleSub: { fontSize: 11, color: C.textDim, marginTop: 1 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  infoLabel: { fontSize: 13, color: C.textSub },
  infoValue: { fontSize: 13, color: C.text, fontWeight: '700', textAlign: 'right', maxWidth: '60%' },
});
