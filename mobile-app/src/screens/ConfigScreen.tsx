import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar,
  ScrollView, StyleSheet, TextInput, Alert, Modal, Share, Clipboard,
} from 'react-native';
import {
  Plus, Trash2, Check, ChevronRight, FileText, X,
  Lock, Unlock, Upload, Copy, Calendar, MessageSquare,
  Shield, Eye, EyeOff,
} from 'lucide-react-native';
import { useVpnStore } from '../store/useVpnStore';
import { C } from '../theme';

const PROTOCOL_OPTIONS = ['V2Ray/Xray', 'SSH', 'VLess', 'HTTP Inject', 'Shadowsocks', 'OpenVPN'];
const TRANSPORT_OPTIONS = ['WebSocket + TLS', 'TCP', 'WebSocket', 'gRPC', 'HTTP/2'];

const PROTOCOL_ICONS: Record<string, string> = {
  'V2Ray/Xray': '⚡',
  'SSH': '🔐',
  'VLess': '🛡',
  'HTTP Inject': '💉',
  'Shadowsocks': '🌑',
  'OpenVPN': '🔒',
};

const PAYLOAD_TEMPLATES: Record<string, string> = {
  'GET': 'GET / HTTP/1.1[crlf]Host: [host][crlf]Connection: Keep-Alive[crlf][crlf]',
  'CONNECT': 'CONNECT [host]:[port] HTTP/1.1[crlf]Host: [host][crlf]User-Agent: Mozilla/5.0[crlf][crlf]',
  'POST': 'POST / HTTP/1.1[crlf]Host: [host][crlf]Content-Length: 0[crlf][crlf]',
  'Custom': '',
};

const EMPTY_FORM = {
  name: '', host: '', port: '443',
  protocol: 'V2Ray/Xray', transport: 'WebSocket + TLS',
  uuid: '', sni: '', path: '/ws',
  sshUser: '', sshPass: '',
  injectHost: '', payload: '', raw: '',
};

const EXPORT_EMPTY = { message: '', expireDate: '', noExpiry: true };

export default function ConfigScreen() {
  const { configs, activeConfig, setActiveConfig, addConfig, deleteConfig, exportConfigString } = useVpnStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showExport, setShowExport] = useState<string | null>(null);
  const [exportForm, setExportForm] = useState(EXPORT_EMPTY);
  const [exportResult, setExportResult] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const f = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    if (!form.name.trim() || !form.host.trim()) {
      Alert.alert('Champs requis', 'Le nom et l\'hôte sont obligatoires.');
      return;
    }
    addConfig({
      id: Date.now().toString(),
      name: form.name.trim(),
      host: form.host.trim(),
      port: parseInt(form.port) || 443,
      protocol: form.protocol,
      transport: form.transport,
      uuid: form.uuid,
      sni: form.sni,
      path: form.path,
      sshUser: form.sshUser,
      sshPass: form.sshPass,
      injectHost: form.injectHost,
      payload: form.payload,
      raw: form.raw,
      isLocked: false,
    });
    setShowAdd(false);
    setForm(EMPTY_FORM);
  };

  const handleExport = () => {
    if (!showExport) return;
    const expiry = exportForm.noExpiry ? undefined : exportForm.expireDate || undefined;
    const result = exportConfigString(showExport, exportForm.message, expiry);
    if (result) {
      setExportResult(result);
    }
  };

  const handleCopyExport = async () => {
    if (!exportResult) return;
    await Clipboard.setString(exportResult);
    Alert.alert('Copié !', 'Le code de configuration a été copié dans le presse-papiers.');
  };

  const handleShareExport = async () => {
    if (!exportResult) return;
    await Share.share({ message: exportResult, title: 'Config Clark VPN' });
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteConfig(id) },
    ]);
  };

  const isSSH = form.protocol === 'SSH';
  const isV2 = ['V2Ray/Xray', 'VLess'].includes(form.protocol);
  const isInject = form.protocol === 'HTTP Inject';

  const applyTemplate = (tpl: string) => {
    f('payload', PAYLOAD_TEMPLATES[tpl] || '');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.teal} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🛠  Atelier Créateur</Text>
          <Text style={styles.headerSub}>{configs.length} configuration(s)</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Plus size={16} color={C.white} strokeWidth={2.5} />
          <Text style={styles.addBtnText}>NOUVEAU</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14 }}>
        {configs.length === 0 ? (
          <View style={styles.empty}>
            <FileText size={52} color={C.textDim} strokeWidth={1.2} />
            <Text style={styles.emptyTitle}>Aucune configuration</Text>
            <Text style={styles.emptySub}>
              Créez un profil complet (SSH, V2Ray, HTTP Inject…){'\n'}puis exportez-le en fichier .clark sécurisé.
            </Text>
            <TouchableOpacity style={styles.emptyAction} onPress={() => setShowAdd(true)}>
              <Plus size={14} color={C.tealLight} strokeWidth={2.5} />
              <Text style={styles.emptyActionText}>Créer un profil</Text>
            </TouchableOpacity>
          </View>
        ) : (
          configs.map(cfg => {
            const isActive = activeConfig?.id === cfg.id;
            return (
              <View key={cfg.id} style={[styles.configCard, isActive && styles.configCardActive]}>
                <TouchableOpacity
                  onPress={() => setActiveConfig(cfg)}
                  activeOpacity={0.75}
                  style={styles.configMain}
                >
                  <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                    <Text style={styles.iconEmoji}>{PROTOCOL_ICONS[cfg.protocol] ?? '🔌'}</Text>
                  </View>
                  <View style={styles.configInfo}>
                    <View style={styles.configTopRow}>
                      <Text style={styles.configName} numberOfLines={1}>{cfg.name}</Text>
                      <View style={styles.badgesRow}>
                        {cfg.isLocked && (
                          <View style={styles.lockedBadge}>
                            <Lock size={9} color={C.yellow} />
                            <Text style={styles.lockedBadgeText}>VERROU</Text>
                          </View>
                        )}
                        {isActive && (
                          <View style={styles.activePill}>
                            <Check size={10} color={C.tealLight} strokeWidth={2.5} />
                            <Text style={styles.activePillText}>ACTIF</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.configMeta}>
                      <View style={[styles.protoBadge, isActive && styles.protoBadgeActive]}>
                        <Text style={[styles.protoText, isActive && styles.protoTextActive]}>
                          {cfg.protocol}
                        </Text>
                      </View>
                      {!cfg.isLocked && (
                        <Text style={styles.configHost} numberOfLines={1}>
                          {cfg.host}:{cfg.port}
                        </Text>
                      )}
                    </View>
                    {cfg.message ? (
                      <Text style={styles.configMsg} numberOfLines={1}>💬 {cfg.message}</Text>
                    ) : null}
                  </View>
                  <ChevronRight size={18} color={isActive ? C.tealLight : C.textDim} />
                </TouchableOpacity>

                {/* Action row */}
                <View style={styles.cardActions}>
                  {!cfg.isLocked && (
                    <TouchableOpacity
                      style={styles.cardActionBtn}
                      onPress={() => { setShowExport(cfg.id); setExportResult(null); setExportForm(EXPORT_EMPTY); }}
                    >
                      <Upload size={14} color={C.tealLight} />
                      <Text style={styles.cardActionText}>EXPORTER</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.cardActionBtn, styles.cardActionDelete]}
                    onPress={() => confirmDelete(cfg.id, cfg.name)}
                  >
                    <Trash2 size={14} color={C.red} />
                    <Text style={[styles.cardActionText, { color: C.red }]}>SUPPR.</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── EXPORT MODAL ───────────────────────────────── */}
      <Modal visible={!!showExport} animationType="slide" transparent onRequestClose={() => setShowExport(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Upload size={18} color={C.tealLight} />
              <Text style={styles.sheetTitle}>EXPORTER LA CONFIG</Text>
              <TouchableOpacity onPress={() => setShowExport(null)} style={styles.closeBtn}>
                <X size={20} color={C.textSub} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 36 }}>
              {exportResult ? (
                // ── Step 2: Result ──────────────────────────────
                <>
                  <View style={styles.exportResultBox}>
                    <Shield size={22} color={C.green} />
                    <Text style={styles.exportResultTitle}>Configuration chiffrée !</Text>
                    <Text style={styles.exportResultSub}>
                      Ce code contient toutes vos données de manière sécurisée.{'\n'}L'utilisateur ne pourra pas voir le payload ni les serveurs.
                    </Text>
                  </View>
                  <View style={styles.exportCodeBox}>
                    <Text style={styles.exportCode} numberOfLines={3}>{exportResult}</Text>
                  </View>
                  <TouchableOpacity style={styles.exportActionBtn} onPress={handleCopyExport}>
                    <Copy size={16} color={C.white} />
                    <Text style={styles.exportActionBtnText}>Copier le code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.exportActionBtn, { backgroundColor: C.surface2, marginTop: 10 }]} onPress={handleShareExport}>
                    <Upload size={16} color={C.tealLight} />
                    <Text style={[styles.exportActionBtnText, { color: C.tealLight }]}>Partager (.clark)</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // ── Step 1: Options ────────────────────────────
                <>
                  <Field label="MESSAGE POUR L'UTILISATEUR">
                    <View style={styles.inputIconWrap}>
                      <MessageSquare size={14} color={C.textDim} style={{ marginRight: 8 }} />
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Ex: Config Orange CI — Valide jusqu'au 30/08"
                        placeholderTextColor={C.textDim}
                        value={exportForm.message}
                        onChangeText={v => setExportForm(p => ({ ...p, message: v }))}
                      />
                    </View>
                  </Field>

                  <Field label="DATE D'EXPIRATION">
                    <View style={styles.expiryOptions}>
                      <TouchableOpacity
                        style={[styles.expiryChip, exportForm.noExpiry && styles.expiryChipActive]}
                        onPress={() => setExportForm(p => ({ ...p, noExpiry: true }))}
                      >
                        <Text style={[styles.expiryChipText, exportForm.noExpiry && styles.expiryChipTextActive]}>Aucune</Text>
                      </TouchableOpacity>
                      {['7 jours', '15 jours', '30 jours', 'Personnalisée'].map(opt => (
                        <TouchableOpacity
                          key={opt}
                          style={[styles.expiryChip, !exportForm.noExpiry && exportForm.expireDate === opt && styles.expiryChipActive]}
                          onPress={() => {
                            const days = opt === '7 jours' ? 7 : opt === '15 jours' ? 15 : opt === '30 jours' ? 30 : 0;
                            if (days > 0) {
                              const d = new Date();
                              d.setDate(d.getDate() + days);
                              setExportForm(p => ({ ...p, noExpiry: false, expireDate: d.toISOString() }));
                            } else {
                              setExportForm(p => ({ ...p, noExpiry: false, expireDate: '' }));
                            }
                          }}
                        >
                          <Text style={[styles.expiryChipText, !exportForm.noExpiry && exportForm.expireDate && opt !== 'Personnalisée' && styles.expiryChipTextActive]}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {!exportForm.noExpiry && !exportForm.expireDate && (
                      <TextInput
                        style={[styles.input, { marginTop: 10 }]}
                        placeholder="YYYY-MM-DD (ex: 2026-08-30)"
                        placeholderTextColor={C.textDim}
                        value={exportForm.expireDate}
                        onChangeText={v => setExportForm(p => ({ ...p, expireDate: v }))}
                      />
                    )}
                  </Field>

                  <View style={styles.securityNote}>
                    <Lock size={14} color={C.yellow} />
                    <Text style={styles.securityNoteText}>
                      Le fichier généré sera chiffré (AES-256). L'utilisateur verra uniquement le message et le nom de la configuration.
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.saveBtn} onPress={handleExport} activeOpacity={0.8}>
                    <Lock size={16} color={C.white} strokeWidth={2.5} />
                    <Text style={styles.saveBtnText}>GÉNÉRER LE FICHIER .CLARK</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── ADD MODAL ─────────────────────────────────── */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Plus size={18} color={C.tealLight} />
              <Text style={styles.sheetTitle}>NOUVELLE CONFIGURATION</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.closeBtn}>
                <X size={20} color={C.textSub} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 18, paddingBottom: 36 }}>

              {/* Nom */}
              <Field label="NOM DU PROFIL">
                <TextInput
                  style={styles.input} placeholder="Ex: VPN Orange Premium"
                  placeholderTextColor={C.textDim} value={form.name}
                  onChangeText={v => f('name', v)}
                />
              </Field>

              {/* Protocole */}
              <Field label="PROTOCOLE">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {PROTOCOL_OPTIONS.map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => f('protocol', p)}
                      style={[styles.chip, form.protocol === p && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, form.protocol === p && styles.chipTextActive]}>
                        {PROTOCOL_ICONS[p]}  {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Field>

              {/* Hôte & Port */}
              <View style={styles.rowFields}>
                <View style={{ flex: 3 }}>
                  <Field label="HÔTE / IP">
                    <TextInput
                      style={styles.input} placeholder="vpn.exemple.com"
                      placeholderTextColor={C.textDim} value={form.host}
                      onChangeText={v => f('host', v)} autoCapitalize="none"
                    />
                  </Field>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Field label="PORT">
                    <TextInput
                      style={styles.input} placeholder="443"
                      placeholderTextColor={C.textDim} value={form.port}
                      onChangeText={v => f('port', v)} keyboardType="number-pad"
                    />
                  </Field>
                </View>
              </View>

              {/* Transport */}
              {!isSSH && (
                <Field label="TRANSPORT">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TRANSPORT_OPTIONS.map(t => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => f('transport', t)}
                        style={[styles.chip, form.transport === t && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, form.transport === t && styles.chipTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Field>
              )}

              {/* V2Ray / VLess fields */}
              {isV2 && (
                <>
                  <Field label="UUID">
                    <TextInput
                      style={styles.input} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      placeholderTextColor={C.textDim} value={form.uuid}
                      onChangeText={v => f('uuid', v)} autoCapitalize="none"
                    />
                  </Field>
                  <View style={styles.rowFields}>
                    <View style={{ flex: 1 }}>
                      <Field label="SNI">
                        <TextInput
                          style={styles.input} placeholder="example.com"
                          placeholderTextColor={C.textDim} value={form.sni}
                          onChangeText={v => f('sni', v)} autoCapitalize="none"
                        />
                      </Field>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Field label="PATH">
                        <TextInput
                          style={styles.input} placeholder="/ws"
                          placeholderTextColor={C.textDim} value={form.path}
                          onChangeText={v => f('path', v)} autoCapitalize="none"
                        />
                      </Field>
                    </View>
                  </View>
                </>
              )}

              {/* SSH fields */}
              {isSSH && (
                <>
                  <View style={styles.rowFields}>
                    <View style={{ flex: 1 }}>
                      <Field label="UTILISATEUR SSH">
                        <TextInput
                          style={styles.input} placeholder="ubuntu"
                          placeholderTextColor={C.textDim} value={form.sshUser}
                          onChangeText={v => f('sshUser', v)} autoCapitalize="none"
                        />
                      </Field>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Field label="MOT DE PASSE">
                        <View style={{ position: 'relative' }}>
                          <TextInput
                            style={[styles.input, { paddingRight: 40 }]} placeholder="••••••••"
                            placeholderTextColor={C.textDim} value={form.sshPass}
                            onChangeText={v => f('sshPass', v)} secureTextEntry={!showPass}
                          />
                          <TouchableOpacity
                            style={styles.eyeBtn}
                            onPress={() => setShowPass(p => !p)}
                          >
                            {showPass ? <EyeOff size={14} color={C.textDim} /> : <Eye size={14} color={C.textDim} />}
                          </TouchableOpacity>
                        </View>
                      </Field>
                    </View>
                  </View>
                </>
              )}

              {/* HTTP Inject host */}
              {isInject && (
                <Field label="INJECT HOST">
                  <TextInput
                    style={styles.input} placeholder="www.orange.ci"
                    placeholderTextColor={C.textDim} value={form.injectHost}
                    onChangeText={v => f('injectHost', v)} autoCapitalize="none"
                  />
                </Field>
              )}

              {/* Payload Generator */}
              <Field label="GÉNÉRATEUR DE PAYLOAD">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {Object.keys(PAYLOAD_TEMPLATES).map(tpl => (
                    <TouchableOpacity
                      key={tpl}
                      style={styles.chip}
                      onPress={() => applyTemplate(tpl)}
                    >
                      <Text style={styles.chipText}>{tpl}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  style={[styles.input, { height: 90, textAlignVertical: 'top', fontFamily: 'monospace', fontSize: 11 }]}
                  placeholder={'GET / HTTP/1.1[crlf]Host: [host][crlf]...'}
                  placeholderTextColor={C.textDim}
                  value={form.payload}
                  onChangeText={v => f('payload', v)}
                  multiline
                />
              </Field>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                <Check size={16} color={C.white} strokeWidth={2.5} />
                <Text style={styles.saveBtnText}>ENREGISTRER</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}
const fieldStyles = StyleSheet.create({
  label: { fontSize: 10, color: C.textDim, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
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
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  addBtnText: { color: C.white, fontWeight: '800', fontSize: 12, letterSpacing: 1 },

  scroll: { flex: 1 },

  empty: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 14, paddingHorizontal: 40,
  },
  emptyTitle: { color: C.text, fontSize: 18, fontWeight: '800' },
  emptySub: { color: C.textSub, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  emptyAction: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    borderWidth: 1, borderColor: C.teal, borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 9, backgroundColor: C.tealGlow,
  },
  emptyActionText: { color: C.tealLight, fontWeight: '700', fontSize: 13 },

  configCard: {
    backgroundColor: C.surface, borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden',
  },
  configCardActive: { borderColor: C.teal, backgroundColor: C.tealGlow },
  configMain: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconBox: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: C.surface2,
    borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center',
  },
  iconBoxActive: { backgroundColor: C.tealGlow, borderColor: C.teal },
  iconEmoji: { fontSize: 22 },
  configInfo: { flex: 1, gap: 4 },
  configTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  configName: { fontSize: 14, color: C.text, fontWeight: '800', flex: 1 },
  badgesRow: { flexDirection: 'row', gap: 5 },
  lockedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: C.yellow,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  lockedBadgeText: { fontSize: 8, color: C.yellow, fontWeight: '800', letterSpacing: 0.5 },
  activePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: C.tealGlow, borderWidth: 1, borderColor: C.teal,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  activePillText: { fontSize: 9, color: C.tealLight, fontWeight: '800', letterSpacing: 0.5 },
  configMeta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  protoBadge: {
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border2,
  },
  protoBadgeActive: { backgroundColor: C.tealGlow, borderColor: C.teal },
  protoText: { fontSize: 9, color: C.textSub, fontWeight: '700', letterSpacing: 0.3 },
  protoTextActive: { color: C.tealLight },
  configHost: { fontSize: 11, color: C.textDim, fontFamily: 'monospace', flex: 1 },
  configMsg: { fontSize: 10, color: C.textSub, fontStyle: 'italic' },

  // Card action row
  cardActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border,
  },
  cardActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10,
  },
  cardActionDelete: { borderLeftWidth: 1, borderLeftColor: C.border },
  cardActionText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: C.tealLight },

  // Export
  exportResultBox: {
    backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: 14, borderWidth: 1, borderColor: C.green,
    padding: 18, alignItems: 'center', gap: 8, marginBottom: 16,
  },
  exportResultTitle: { color: C.green, fontSize: 15, fontWeight: '800' },
  exportResultSub: { color: C.textSub, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  exportCodeBox: {
    backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.border,
    padding: 12, marginBottom: 16,
  },
  exportCode: { color: C.textDim, fontSize: 10, fontFamily: 'monospace', lineHeight: 15 },
  exportActionBtn: {
    backgroundColor: C.teal, borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  exportActionBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },

  expiryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  expiryChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
  },
  expiryChipActive: { backgroundColor: C.tealGlow, borderColor: C.teal },
  expiryChipText: { color: C.textSub, fontSize: 12, fontWeight: '600' },
  expiryChipTextActive: { color: C.tealLight, fontWeight: '700' },

  securityNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', padding: 12, marginBottom: 16,
  },
  securityNoteText: { color: C.textSub, fontSize: 11, flex: 1, lineHeight: 17 },

  inputIconWrap: { flexDirection: 'row', alignItems: 'center' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    maxHeight: '94%', borderTopWidth: 1, borderColor: C.border,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.border, gap: 10,
  },
  sheetTitle: { flex: 1, color: C.text, fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  closeBtn: { padding: 4 },
  sheetScroll: {},

  rowFields: { flexDirection: 'row' },
  input: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, color: C.text, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13,
  },
  eyeBtn: {
    position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
  },
  chipActive: { backgroundColor: C.tealGlow, borderColor: C.teal },
  chipText: { color: C.textSub, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: C.tealLight, fontWeight: '700' },
  saveBtn: {
    backgroundColor: C.teal, borderRadius: 12, padding: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6,
  },
  saveBtnText: { color: C.white, fontWeight: '900', fontSize: 14, letterSpacing: 1.5 },
});
