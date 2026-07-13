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
    return (
      <TouchableOpacity 
        onPress={() => handleSelectServer(item)}
        className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border-2 ${isSelected ? 'border-primary-500 bg-primary-500/10' : 'border-dark-700 bg-dark-800'}`}
      >
        <View className="flex-row items-center">
          <Text className="text-3xl mr-4">{item.flag}</Text>
          <View>
            <Text className="text-white font-bold text-lg">{item.name}</Text>
            <Text className="text-slate-400 text-sm">{item.protocol}</Text>
          </View>
        </View>
        
        <View className="items-end">
          <View className="flex-row items-center mb-1">
            <Wifi size={14} color={item.ping < 50 ? '#22c55e' : item.ping < 100 ? '#eab308' : '#ef4444'} />
            <Text className="text-slate-300 text-xs ml-1">{item.ping} ms</Text>
          </View>
          <Text className="text-slate-400 text-xs">Load: {item.load}%</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
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
