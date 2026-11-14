import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrivalsScreen } from './src/screens/ArrivalsScreen';
import { MapScreen } from './src/screens/MapScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SettingsProvider } from './src/state/settings';
import { TrafficProvider } from './src/state/traffic';
import { colors } from './src/theme';
import { useAutoUpdate } from './src/updates/useAutoUpdate';

type Tab = 'arrivals' | 'map' | 'settings';

const TABS: { id: Tab; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'arrivals', label: 'Llegadas', icon: 'airplane-landing' },
  { id: 'map', label: 'Mapa', icon: 'map-outline' },
  { id: 'settings', label: 'Ajustes', icon: 'tune-variant' },
];

function Main() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('arrivals');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useAutoUpdate();

  return (
    <View style={[styles.root, { paddingTop: tab === 'map' ? 0 : insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {tab === 'arrivals' && (
          <ArrivalsScreen
            onSelect={(f) => {
              setSelectedId(f.id);
              setTab('map');
            }}
          />
        )}
        {tab === 'map' && <MapScreen selectedId={selectedId} onSelect={setSelectedId} />}
        {tab === 'settings' && <SettingsScreen />}
      </View>
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map((t) => {
          const on = t.id === tab;
          return (
            <Pressable key={t.id} style={styles.tab} onPress={() => setTab(t.id)}>
              <MaterialCommunityIcons name={t.icon} size={24} color={on ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <TrafficProvider>
          <Main />
        </TrafficProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { fontSize: 11, color: colors.textMuted },
  tabLabelOn: { color: colors.primary, fontWeight: '600' },
});
