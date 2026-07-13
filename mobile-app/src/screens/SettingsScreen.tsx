import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-dark-900 justify-center items-center">
      <Text className="text-white text-xl">Settings</Text>
    </SafeAreaView>
  );
}
