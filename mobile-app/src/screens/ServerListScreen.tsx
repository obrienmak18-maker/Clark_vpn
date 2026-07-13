import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Wifi, Server as ServerIcon } from 'lucide-react-native';
import axios from 'axios';
import { useVpnStore } from '../store/useVpnStore';
import { Server } from '../types';

export default function ServerListScreen() {
  const navigation = useNavigation();
  const { currentServer, setCurrentServer } = useVpnStore();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      // Replace with your actual backend IP address if testing on a physical device.
      // E.g., 'http://192.168.1.100:3000/api/servers/active'
      // Note: we'd normally use the token for auth here, but for now we'll just mock if it fails.
      const response = await axios.get('http://10.0.2.2:3000/api/servers/active', {
        headers: { Authorization: 'Bearer MOCK_TOKEN' }
      });
      setServers(response.data.servers);
    } catch (error) {
      console.warn('Failed to fetch from backend, using mock servers:', error);
      // Fallback to mock data for demonstration
      setServers([
        { id: '1', name: 'Paris - Premium', location: 'France', flag: '🇫🇷', ipAddress: '10.0.0.1', port: 443, protocol: 'DARK_TUNNEL', load: 25, ping: 32 },
        { id: '2', name: 'Frankfurt - Gaming', location: 'Germany', flag: '🇩🇪', ipAddress: '10.0.0.2', port: 443, protocol: 'HTTP_INJECTOR', load: 40, ping: 15 },
        { id: '3', name: 'New York - Fast', location: 'USA', flag: '🇺🇸', ipAddress: '10.0.0.3', port: 443, protocol: 'OPENVPN', load: 80, ping: 110 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectServer = (server: Server) => {
    setCurrentServer(server);
    navigation.goBack();
  };

  const renderServer = ({ item }: { item: Server }) => {
    const isSelected = currentServer?.id === item.id;
    const { Activity } = require('lucide-react-native');
    
    return (
      <TouchableOpacity 
        onPress={() => handleSelectServer(item)}
        className={`flex-row items-center justify-between p-5 mb-4 rounded-[24px] border-2 ${
          isSelected ? 'border-primary-500 bg-primary-500/10' : 'border-dark-800 bg-dark-900'
        }`}
      >
        <View className="flex-row items-center flex-1">
          <View className="bg-dark-800 w-14 h-14 rounded-2xl items-center justify-center border border-dark-700">
            <Text className="text-3xl">{item.flag}</Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-white font-black text-lg" numberOfLines={1}>{item.name}</Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-accent-purple/10 px-2 py-0.5 rounded-md border border-accent-purple/20 mr-2">
                <Text className="text-accent-purple text-[10px] font-bold">{item.protocol}</Text>
              </View>
              <Text className="text-slate-500 text-xs font-medium">{item.location}</Text>
            </View>
          </View>
        </View>

        <View className="items-end ml-2">
          <View className="flex-row items-center bg-dark-800 px-3 py-1.5 rounded-xl border border-dark-700">
            <Wifi size={12} color={item.ping < 50 ? '#22c55e' : item.ping < 100 ? '#f59e0b' : '#ef4444'} />
            <Text className="text-white text-xs font-black ml-1.5">{item.ping}ms</Text>
          </View>
          <View className="mt-2 flex-row items-center">
            <Text className="text-slate-500 text-[10px] font-bold mr-2">LOAD</Text>
            <View className="w-12 h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <View 
                className={`h-full ${item.load < 50 ? 'bg-primary-500' : item.load < 80 ? 'bg-accent-amber' : 'bg-red-500'}`} 
                style={{ width: `${item.load}%` }} 
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-950">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-dark-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold ml-4">Select Server</Text>
      </View>

      {/* List */}
      <View className="flex-1 px-4 pt-4">
        {loading ? (
          <ActivityIndicator size="large" color="#22c55e" className="mt-10" />
        ) : (
          <FlatList 
            data={servers}
            keyExtractor={(item) => item.id}
            renderItem={renderServer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
