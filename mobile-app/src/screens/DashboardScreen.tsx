import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Shield, ShieldAlert, Activity, Globe, Wifi } from 'lucide-react-native';
import { useVpnStore } from '../store/useVpnStore';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { status, currentServer, stats, connect, disconnect } = useVpnStore();

  const isConnected = status === 'CONNECTED';
  const isConnecting = status === 'CONNECTING';

  const handleToggleVpn = () => {
    if (isConnected || isConnecting) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <Text className="text-white text-2xl font-bold tracking-wider">CLARK<Text className="text-primary-500">VPN</Text></Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <View className="w-10 h-10 bg-dark-800 rounded-full items-center justify-center">
            <Text className="text-white">⚙️</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Connection Area */}
      <View className="flex-1 items-center justify-center">
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleToggleVpn}
          disabled={isConnecting}
          className={`w-48 h-48 rounded-full items-center justify-center border-4 ${
            isConnected ? 'border-primary-500 bg-primary-500/20' : 
            isConnecting ? 'border-yellow-500 bg-yellow-500/20' : 
            'border-dark-700 bg-dark-800'
          }`}
        >
          {isConnected ? (
            <Shield size={64} color="#22c55e" />
          ) : isConnecting ? (
            <Activity size={64} color="#eab308" />
          ) : (
            <ShieldAlert size={64} color="#94a3b8" />
          )}
          <Text className={`mt-4 text-lg font-bold ${
            isConnected ? 'text-primary-500' : 
            isConnecting ? 'text-yellow-500' : 
            'text-slate-400'
          }`}>
            {isConnected ? 'CONNECTED' : isConnecting ? 'CONNECTING...' : 'TAP TO CONNECT'}
          </Text>
        </TouchableOpacity>

        {/* Server Selection */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('ServerList')}
          className="mt-12 bg-dark-800 px-6 py-4 rounded-2xl flex-row items-center w-4/5 justify-between"
        >
          <View className="flex-row items-center">
            <Globe size={24} color="#22c55e" />
            <View className="ml-4">
              <Text className="text-slate-400 text-xs uppercase font-bold">Current Server</Text>
              <Text className="text-white text-lg font-semibold">
                {currentServer ? `${currentServer.flag} ${currentServer.name}` : 'Select a Server'}
              </Text>
            </View>
          </View>
          <Text className="text-primary-500 text-xl">→</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics Bottom Panel */}
      <View className="bg-dark-800 rounded-t-3xl p-6">
        <View className="flex-row justify-between mb-4">
          <View className="items-center">
            <Text className="text-slate-400 text-xs mb-1">DOWNLOAD</Text>
            <Text className="text-white font-bold">{stats.downloadRate}</Text>
          </View>
          <View className="items-center">
            <Text className="text-slate-400 text-xs mb-1">UPLOAD</Text>
            <Text className="text-white font-bold">{stats.uploadRate}</Text>
          </View>
          <View className="items-center">
            <Text className="text-slate-400 text-xs mb-1">PING</Text>
            <Text className="text-white font-bold">{stats.ping}</Text>
          </View>
        </View>
        <View className="bg-dark-700 h-1 w-full rounded-full overflow-hidden">
          <View className="bg-primary-500 h-full w-1/3" />
        </View>
      </View>
    </SafeAreaView>
  );
}
