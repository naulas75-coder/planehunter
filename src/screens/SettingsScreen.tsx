import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AIRCRAFT_GROUPS } from '../data/aircraftTypes';
import { AIRPORTS } from '../data/airports';
import { useSettings } from '../state/settings';
import { colors, radius } from '../theme';

export function SettingsScreen() {
  const { airport, setAirport, favorites, toggleFavorite } = useSettings();
  const makers = [...new Set(AIRCRAFT_GROUPS.map((g) => g.maker))];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>Ajustes</Text>

      <Text style={styles.h2}>Mi aeropuerto</Text>
      <View style={styles.card}>
        {AIRPORTS.map((a, i) => (
          <Pressable key={a.icao} onPress={() => setAirport(a.icao)} style={[styles.item, i > 0 && styles.sep]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                {a.city} <Text style={styles.code}>{a.iata}</Text>
              </Text>
              <Text style={styles.itemSub}>{a.name}</Text>
            </View>
            {a.icao === airport.icao ? <MaterialCommunityIcons name="check" size={22} color={colors.primary} /> : null}
          </Pressable>
        ))}
      </View>

      <Text style={styles.h2}>Aviones favoritos</Text>
      {makers.map((m) => (
        <View key={m}>
          <Text style={styles.maker}>{m}</Text>
          <View style={styles.card}>
            {AIRCRAFT_GROUPS.filter((g) => g.maker === m).map((g, i) => (
              <View key={g.id} style={[styles.item, i > 0 && styles.sep]}>
                <Text style={[styles.itemTitle, { flex: 1 }]}>{g.label}</Text>
                <Switch
                  value={favorites.includes(g.id)}
                  onValueChange={() => toggleFavorite(g.id)}
                  trackColor={{ true: colors.primary, false: colors.border }}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
      <Text style={styles.foot}>Datos en vivo de adsb.lol (red ADS-B colaborativa).</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 18, marginBottom: 8 },
  maker: { fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', marginTop: 10, marginBottom: 6, marginLeft: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11 },
  sep: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  itemTitle: { fontSize: 16, color: colors.text },
  itemSub: { fontSize: 13, color: colors.textMuted, marginTop: 1 },
  code: { color: colors.primary, fontWeight: '600' },
  foot: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
