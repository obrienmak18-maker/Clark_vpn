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
    <SafeAreaView className="flex-1 bg-dark-900">
      <View className="flex-row items-center px-4 py-4 border-b border-dark-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold ml-4">Config & Profiles</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        <View className="bg-dark-800 rounded-2xl p-6 mb-6">
          <Text className="text-white text-lg font-bold mb-2">Active Profile</Text>
          {activeProfile ? (
            <View className="flex-row items-center mt-2">
              <FileJson color="#22c55e" size={24} />
              <Text className="text-primary-500 font-semibold ml-3 text-lg">{activeProfile.name}</Text>
            </View>
          ) : (
            <Text className="text-slate-400">No profile loaded. Import a .clark file.</Text>
          )}
        </View>

        <TouchableOpacity 
          onPress={handleImport}
          disabled={loading}
          className="bg-primary-600 flex-row items-center justify-center py-4 rounded-xl mb-4"
        >
          <Download color="white" size={20} />
          <Text className="text-white font-bold text-lg ml-2">Import .clark Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          disabled={!activeProfile}
          className={`flex-row items-center justify-center py-4 rounded-xl border border-dark-700 ${!activeProfile ? 'opacity-50' : ''}`}
        >
          <Upload color="white" size={20} />
          <Text className="text-white font-bold text-lg ml-2">Export Current Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
