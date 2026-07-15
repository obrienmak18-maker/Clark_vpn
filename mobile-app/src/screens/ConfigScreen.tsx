import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, StyleSheet, TextInput, Alert, Modal,
} from 'react-native';
import { useVpnStore } from '../store/useVpnStore';

const PROTOCOL_OPTIONS = ['SSH', 'V2Ray/Xray', 'VLess', 'HTTP Inject', 'Shadowsocks', 'OpenVPN'];
const TRANSPORT_OPTIONS = ['TCP', 'WebSocket', 'WebSocket + TLS', 'gRPC', 'HTTP/2'];

export default function ConfigScreen() {
  const { configs, activeConfig, setActiveConfig, addConfig, deleteConfig } = useVpnStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    host: '',
    port: '443',
    protocol: 'V2Ray/Xray',
    transport: 'WebSocket + TLS',
    uuid: '',
    sni: '',
    path: '/ws',
    sshUser: '',
    sshPass: '',
    injectHost: '',
    raw: '',
  });

  const handleSave = () => {
    if (!form.name || !form.host) {
      Alert.alert('Erreur', 'Le nom et le serveur sont obligatoires.');
      return;
    }
    addConfig({
      id: Date.now().toString(),
      name: form.name,
      host: form.host,
      port: parseInt(form.port) || 443,
      protocol: form.protocol,
      transport: form.transport,
      uuid: form.uuid,
      sni: form.sni,
      path: form.path,
      sshUser: form.sshUser,
      sshPass: form.sshPass,
      injectHost: form.injectHost,
      raw: form.raw,
    });
    setShowAddModal(false);
    setForm({ name: '', host: '', port: '443', protocol: 'V2Ray/Xray', transport: 'WebSocket + TLS', uuid: '', sni: '', path: '/ws', sshUser: '', sshPass: '', injectHost: '', raw: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <View style={styles.header}>
        <Text style={styles.title}>CONFIGURATIONS</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>+ AJOUTER</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {configs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyText}>Aucune configuration</Text>
            <Text style={styles.emptySubtext}>Appuyez sur "+ AJOUTER" pour créer votre première config VPN</Text>
          </View>
        ) : (
          configs.map(cfg => {
            const isActive = activeConfig?.id === cfg.id;
            return (
              <TouchableOpacity
                key={cfg.id}
                style={[styles.configCard, isActive && styles.configCardActive]}
                onPress={() => setActiveConfig(cfg)}
                onLongPress={() => Alert.alert('Supprimer', `Supprimer "${cfg.name}" ?`, [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: () => deleteConfig(cfg.id) },
                ])}
              >
                <View style={styles.configLeft}>
                  <View style={[styles.protocolBadge, isActive && styles.protocolBadgeActive]}>
                    <Text style={[styles.protocolText, isActive && styles.protocolTextActive]}>{cfg.protocol}</Text>
                  </View>
                  <Text style={styles.configName}>{cfg.name}</Text>
                  <Text style={styles.configSub}>{cfg.host}:{cfg.port} • {cfg.transport}</Text>
                </View>
                <View style={styles.configRight}>
                  {isActive && <View style={styles.activeDot} />}
                  <Text style={styles.arrowText}>›</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Config Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>NOUVELLE CONFIG</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Field label="NOM" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="ex: Orange CI - VLess" />
              <Field label="SERVEUR (HOST/IP)" value={form.host} onChangeText={v => setForm(f => ({ ...f, host: v }))} placeholder="ex: 1.2.3.4 ou vpn.example.com" />
              <Field label="PORT" value={form.port} onChangeText={v => setForm(f => ({ ...f, port: v }))} placeholder="443" keyboardType="number-pad" />

              <Text style={styles.fieldLabel}>PROTOCOLE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {PROTOCOL_OPTIONS.map(p => (
                  <TouchableOpacity key={p} style={[styles.chip, form.protocol === p && styles.chipActive]}
                    onPress={() => setForm(f => ({ ...f, protocol: p }))}>
                    <Text style={[styles.chipText, form.protocol === p && styles.chipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>TRANSPORT</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {TRANSPORT_OPTIONS.map(t => (
                  <TouchableOpacity key={t} style={[styles.chip, form.transport === t && styles.chipActive]}
                    onPress={() => setForm(f => ({ ...f, transport: t }))}>
                    <Text style={[styles.chipText, form.transport === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {(form.protocol === 'V2Ray/Xray' || form.protocol === 'VLess') && (
                <>
                  <Field label="UUID" value={form.uuid} onChangeText={v => setForm(f => ({ ...f, uuid: v }))} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                  <Field label="SNI (Host TLS)" value={form.sni} onChangeText={v => setForm(f => ({ ...f, sni: v }))} placeholder="ex: cloudflare.com" />
                  <Field label="PATH WebSocket" value={form.path} onChangeText={v => setForm(f => ({ ...f, path: v }))} placeholder="/ws" />
                </>
              )}
              {form.protocol === 'SSH' && (
                <>
                  <Field label="UTILISATEUR SSH" value={form.sshUser} onChangeText={v => setForm(f => ({ ...f, sshUser: v }))} placeholder="root" />
                  <Field label="MOT DE PASSE SSH" value={form.sshPass} onChangeText={v => setForm(f => ({ ...f, sshPass: v }))} placeholder="password" secureTextEntry />
                </>
              )}
              {form.protocol === 'HTTP Inject' && (
                <Field label="INJECT HOST" value={form.injectHost} onChangeText={v => setForm(f => ({ ...f, injectHost: v }))} placeholder="ex: http://gestion.orange.ci/" />
              )}
              <Field label="CONFIG RAW (optionnel)" value={form.raw} onChangeText={v => setForm(f => ({ ...f, raw: v }))} placeholder="Coller ici votre config brute..." multiline />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>💾  SAUVEGARDER</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, multiline }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#484f58"
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize="none"
        autoCorrect={false}
      />
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
  addBtn: { backgroundColor: '#1f3a5f', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#58a6ff' },
  addBtnText: { color: '#58a6ff', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: '#e6edf3', fontSize: 18, fontWeight: '700' },
  emptySubtext: { color: '#8b949e', fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
  configCard: {
    backgroundColor: '#161b22', borderRadius: 12, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#30363d',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  configCardActive: { borderColor: '#58a6ff', backgroundColor: '#0d2040' },
  configLeft: { flex: 1, gap: 4 },
  configName: { color: '#e6edf3', fontSize: 15, fontWeight: '700' },
  configSub: { color: '#8b949e', fontSize: 12 },
  configRight: { alignItems: 'center', gap: 4 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3fb950' },
  arrowText: { color: '#58a6ff', fontSize: 22 },
  protocolBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    backgroundColor: '#21262d', borderRadius: 6, marginBottom: 4,
  },
  protocolBadgeActive: { backgroundColor: '#1f3a5f' },
  protocolText: { color: '#8b949e', fontSize: 10, fontWeight: '700' },
  protocolTextActive: { color: '#58a6ff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#161b22', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderBottomColor: '#21262d',
  },
  modalTitle: { color: '#e6edf3', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  closeBtn: { color: '#8b949e', fontSize: 20 },
  modalScroll: { padding: 20 },
  fieldLabel: { color: '#8b949e', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  input: {
    backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#30363d',
    borderRadius: 8, color: '#e6edf3', paddingHorizontal: 12, paddingVertical: 10, fontSize: 13,
  },
  chipRow: { flexDirection: 'row', marginBottom: 14 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#30363d', marginRight: 8,
  },
  chipActive: { backgroundColor: '#1f3a5f', borderColor: '#58a6ff' },
  chipText: { color: '#8b949e', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#58a6ff' },
  saveBtn: {
    backgroundColor: '#1f3a5f', borderWidth: 1, borderColor: '#58a6ff',
    borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 10,
  },
  saveBtnText: { color: '#58a6ff', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
});
