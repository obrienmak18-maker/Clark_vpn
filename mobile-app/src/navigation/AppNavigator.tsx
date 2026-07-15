import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home, Settings, FileText, Wrench, SlidersHorizontal,
} from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import LogScreen from '../screens/LogScreen';
import ToolsScreen from '../screens/ToolsScreen';
import ConfigScreen from '../screens/ConfigScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ServerListScreen from '../screens/ServerListScreen';
import { C } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({
  label, Icon, focused,
}: { label: string; Icon: any; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Icon
        size={22}
        color={focused ? C.tealLight : C.textDim}
        strokeWidth={focused ? 2.2 : 1.8}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Accueil" Icon={Home} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Config"
        component={ConfigScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Config" Icon={Settings} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Journal" Icon={FileText} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Tools"
        component={ToolsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Outils" Icon={Wrench} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Params" Icon={SlidersHorizontal} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="ServerList"
          component={ServerListScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: C.surface,
    borderTopColor: C.border,
    borderTopWidth: 1,
    height: 68,
    paddingBottom: 10,
    paddingTop: 6,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 56,
  },
  tabLabel: {
    fontSize: 9,
    color: C.textDim,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tabLabelFocused: {
    color: C.tealLight,
    fontWeight: '700',
  },
});
