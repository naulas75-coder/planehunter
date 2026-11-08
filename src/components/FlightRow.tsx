import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Flight } from '../api/traffic';
import { colors, radius } from '../theme';

export function formatAltitude(ft: number | null) {
  if (ft === null) return 'En tierra';
  return `${Math.round(ft / 100) * 100} ft`;
}

export function FlightRow({ flight, favorite, onPress }: { flight: Flight; favorite: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, favorite && styles.fav, pressed && styles.pressed]}>
      <View style={[styles.icon, favorite && styles.iconFav]}>
        <MaterialCommunityIcons name="airplane-landing" size={22} color={favorite ? colors.primaryText : colors.primary} />
      </View>
      <View style={styles.main}>
        <Text style={styles.title}>
          {flight.callsign}
          {flight.typeLabel ? <Text style={styles.type}>  ·  {flight.typeLabel}</Text> : null}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {[flight.operator, flight.registration, flight.origin && `desde ${flight.origin}`].filter(Boolean).join('  ·  ') || flight.type || ''}
        </Text>
        <Text style={styles.sub}>
          {Math.round(flight.distanceKm)} km  ·  {formatAltitude(flight.altitudeFt)}
          {flight.routeConfirmed ? '  ·  ruta confirmada' : ''}
        </Text>
      </View>
      <View style={styles.eta}>
        <Text style={styles.etaNum}>{flight.etaMin ?? '–'}</Text>
        <Text style={styles.etaUnit}>min</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  fav: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  pressed: { opacity: 0.7 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  iconFav: { backgroundColor: colors.favorite },
  main: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  type: { fontWeight: '400', color: colors.primary },
  sub: { fontSize: 13, color: colors.textMuted },
  eta: { alignItems: 'center', minWidth: 44 },
  etaNum: { fontSize: 22, fontWeight: '600', color: colors.text },
  etaUnit: { fontSize: 12, color: colors.textMuted },
});
