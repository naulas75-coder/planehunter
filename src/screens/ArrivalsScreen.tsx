import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import type { Flight } from '../api/traffic';
import { FlightRow } from '../components/FlightRow';
import { useSettings } from '../state/settings';
import { useTraffic } from '../state/traffic';
import { colors, radius } from '../theme';

export function ArrivalsScreen({ onSelect }: { onSelect: (f: Flight) => void }) {
  const { airport, favoriteCodes } = useSettings();
  const { flights, loading, error, updatedAt, refresh } = useTraffic();
  const [onlyFavorites, setOnlyFavorites] = useState(true);

  const isFav = (f: Flight) => !!f.type && favoriteCodes.has(f.type);
  const arrivals = useMemo(
    () =>
      flights
        .filter((f) => f.arriving && (!onlyFavorites || isFav(f)))
        .sort((a, b) => (a.etaMin ?? 999) - (b.etaMin ?? 999)),
    [flights, onlyFavorites, favoriteCodes],
  );
  const favCount = flights.filter((f) => f.arriving && isFav(f)).length;

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Llegadas a {airport.iata}</Text>
      <Text style={styles.muted}>
        {airport.name}
        {updatedAt ? `  ·  actualizado ${updatedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : ''}
      </Text>

      <View style={styles.segment}>
        {[
          { v: true, label: `Favoritos (${favCount})` },
          { v: false, label: 'Todas' },
        ].map((o) => (
          <Pressable key={o.label} onPress={() => setOnlyFavorites(o.v)} style={[styles.segBtn, onlyFavorites === o.v && styles.segOn]}>
            <Text style={[styles.segText, onlyFavorites === o.v && styles.segTextOn]}>{o.label}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={arrivals}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => <FlightRow flight={item} favorite={isFav(item)} onPress={() => onSelect(item)} />}
        refreshControl={<RefreshControl refreshing={loading && flights.length === 0} onRefresh={refresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {loading
              ? 'Buscando vuelos…'
              : onlyFavorites
                ? 'Ahora mismo no se acerca ninguno de tus aviones favoritos.'
                : 'No hay llegadas detectadas ahora mismo.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  h1: { fontSize: 26, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  segment: { flexDirection: 'row', backgroundColor: colors.primarySoft, borderRadius: radius.button, padding: 3, marginVertical: 14 },
  segBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.button - 2, alignItems: 'center' },
  segOn: { backgroundColor: colors.surface },
  segText: { color: colors.textMuted, fontWeight: '500' },
  segTextOn: { color: colors.text },
  error: { color: colors.danger, marginBottom: 10 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, paddingHorizontal: 20 },
});
