import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Shield, ShieldAlert, Activity, Globe, Menu } from 'lucide-react-native';
import { useVpnStore } from '../store/useVpnStore';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
    const { status, currentServer, stats, connect, disconnect } = useVpnStore();

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'CONNECTING') {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotation.stopAnimation();
      rotation.setValue(0);
    }
  }, [status]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
    <SafeAreaView className="flex-1 bg-dark-950">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <View>
          <Text className="text-white text-2xl font-bold tracking-wider">CLARK<Text className="text-primary-500">VPN</Text></Text>
          <View className="flex-row items-center mt-1">
            <View className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-primary-500' : 'bg-slate-500'}`} />
            <Text className="text-slate-400 text-xs font-medium">{isConnected ? 'SERVICE ACTIVE' : 'DISCONNECTED'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="bg-dark-800 p-2 rounded-xl"
          onPress={() => navigation.openDrawer && navigation.openDrawer()}
        >
          <Menu size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Connection Area */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Protocol Badge */}
        <View className="bg-accent-purple/10 px-4 py-1.5 rounded-full mb-8 border border-accent-purple/20">
          <Text className="text-accent-purple font-bold text-xs uppercase tracking-widest">HTTP Injector Mode</Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleToggleVpn}
          disabled={isConnecting}
          className={`w-56 h-56 rounded-full items-center justify-center border-8 ${
            isConnected ? 'border-primary-500 bg-primary-500/10' : 
            isConnecting ? 'border-accent-amber bg-accent-amber/10' : 
            'border-dark-800 bg-dark-900'
          }`}
          style={{
            shadowColor: isConnected ? "#22c55e" : "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isConnected ? 0.5 : 0,
            shadowRadius: 20,
            elevation: isConnected ? 10 : 0
          }}
        >
          {isConnected ? (
            <Shield size={64} color="#22c55e" />
          ) : isConnecting ? (
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Activity size={64} color="#eab308" />
            </Animated.View>
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
      <View className="bg-dark-900 rounded-t-[40px] p-8 border-t border-dark-800">
        <View className="flex-row justify-between mb-8">
          <View className="items-center flex-1">
            <View className="bg-accent-blue/10 p-2 rounded-lg mb-2">
              <Activity size={16} color="#3b82f6" />
            </View>
            <Text className="text-slate-500 text-[10px] font-bold uppercase mb-1">Download</Text>
            <Text className="text-white font-black text-lg">{stats.downloadRate}</Text>
          </View>
          
          <View className="w-[1px] h-10 bg-dark-800 self-center" />

          <View className="items-center flex-1">
            <View className="bg-primary-500/10 p-2 rounded-lg mb-2">
              <Activity size={16} color="#22c55e" />
            </View>
            <Text className="text-slate-500 text-[10px] font-bold uppercase mb-1">Upload</Text>
            <Text className="text-white font-black text-lg">{stats.uploadRate}</Text>
          </View>

          <View className="w-[1px] h-10 bg-dark-800 self-center" />

          <View className="items-center flex-1">
            <View className="bg-accent-amber/10 p-2 rounded-lg mb-2">
              <Wifi size={16} color="#f59e0b" />
            </View>
            <Text className="text-slate-500 text-[10px] font-bold uppercase mb-1">Ping</Text>
            <Text className="text-white font-black text-lg">{stats.ping}</Text>
          </View>
        </View>
        
        <TouchableOpacity className="bg-dark-800 py-4 rounded-2xl items-center border border-dark-700">
          <Text className="text-slate-300 font-bold">VIEW CONNECTION LOGS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
