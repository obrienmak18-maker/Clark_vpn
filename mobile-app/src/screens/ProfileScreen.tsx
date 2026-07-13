import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Download, Upload, FileJson } from 'lucide-react-native';
import { useVpnStore } from '../store/useVpnStore';
import { importProfileFile } from '../utils/fileSystem';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { activeProfile, setActiveProfile } = useVpnStore();
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    try {
      setLoading(true);
      const profile = await importProfileFile();
      if (profile) {
        setActiveProfile(profile);
        Alert.alert('Success', `Imported profile: ${profile.name}`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-950">
      <View className="flex-row items-center px-4 py-4 border-b border-dark-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-black ml-4">Config & Profiles</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-8">
        <View className="bg-dark-900 rounded-[32px] p-8 mb-8 border border-dark-800">
          <Text className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Current Configuration</Text>
          {activeProfile ? (
            <View className="flex-row items-center">
              <View className="bg-primary-500/10 p-4 rounded-2xl border border-primary-500/20">
                <FileJson color="#22c55e" size={32} />
              </View>
              <View className="ml-4">
                <Text className="text-white font-black text-xl">{activeProfile.name}</Text>
                <Text className="text-primary-500 text-xs font-bold mt-1">ACTIVE PROFILE</Text>
              </View>
            </View>
          ) : (
            <View className="items-center py-4">
              <Text className="text-slate-400 font-medium text-center">No active profile. Import a .clark file to start tunneling.</Text>
            </View>
          )}
        </View>

        <View className="space-y-4">
          <TouchableOpacity 
            onPress={handleImport}
            disabled={loading}
            className="bg-primary-500 flex-row items-center justify-center py-5 rounded-2xl shadow-lg shadow-primary-500/20"
          >
            <Download color="white" size={24} />
            <Text className="text-white font-black text-lg ml-3">Import .clark File</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            disabled={!activeProfile}
            className={`flex-row items-center justify-center py-5 rounded-2xl border-2 border-dark-800 bg-dark-900 mt-4 ${!activeProfile ? 'opacity-40' : ''}`}
          >
            <Upload color="white" size={24} />
            <Text className="text-white font-black text-lg ml-3">Export Config</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-12">
          <Text className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Pro Tips</Text>
          <View className="bg-dark-900/50 p-4 rounded-2xl border border-dark-800">
            <Text className="text-slate-400 text-xs leading-5">
              • .clark files contain your HTTP injection settings.{"\n"}
              • Make sure your payload matches the target network.{"\n"}
              • You can export your current setup to share with friends.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
