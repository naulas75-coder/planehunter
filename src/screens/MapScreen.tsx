import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { Flight } from '../api/traffic';
import { formatAltitude } from '../components/FlightRow';
import { useSettings } from '../state/settings';
import { useTraffic } from '../state/traffic';
import { colors, radius } from '../theme';

type Props = { selectedId: string | null; onSelect: (id: string | null) => void };

export function MapScreen({ selectedId, onSelect }: Props) {
  const { airport, favoriteCodes } = useSettings();
  const { flights } = useTraffic();
  const map = useRef<MapView>(null);
  const selected = flights.find((f) => f.id === selectedId) ?? null;

  useEffect(() => {
    map.current?.animateToRegion({ latitude: airport.lat, longitude: airport.lon, latitudeDelta: 1.6, longitudeDelta: 1.6 }, 400);
  }, [airport.icao]);

  // Al venir de la lista, centra el avión elegido.
  useEffect(() => {
    if (selected) map.current?.animateCamera({ center: { latitude: selected.lat, longitude: selected.lon } }, { duration: 400 });
  }, [selectedId]);

  return (
    <View style={styles.container}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: airport.lat, longitude: airport.lon, latitudeDelta: 1.6, longitudeDelta: 1.6 }}
        showsPointsOfInterests={false}
        onPress={() => onSelect(null)}
      >
        <Marker coordinate={{ latitude: airport.lat, longitude: airport.lon }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.airport}>
            <Text style={styles.airportText}>{airport.iata}</Text>
          </View>
        </Marker>
        {flights.map((f) => (
          <PlaneMarker
            key={f.id}
            flight={f}
            favorite={!!f.type && favoriteCodes.has(f.type)}
            selected={f.id === selectedId}
            onPress={() => onSelect(f.id)}
          />
        ))}
      </MapView>

      {selected ? <FlightCard flight={selected} favorite={!!selected.type && favoriteCodes.has(selected.type)} onClose={() => onSelect(null)} /> : null}
    </View>
  );
}

function PlaneMarker({ flight, favorite, selected, onPress }: { flight: Flight; favorite: boolean; selected: boolean; onPress: () => void }) {
  const color = selected ? colors.text : favorite ? colors.favorite : colors.plane;
  const size = favorite || selected ? 30 : 20;
  return (
    <Marker
      coordinate={{ latitude: flight.lat, longitude: flight.lon }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={(e) => {
        e.stopPropagation();
        onPress();
      }}
      tracksViewChanges={false}
      zIndex={selected ? 3 : favorite ? 2 : 1}
    >
      {/* El icono apunta al noreste (45°): se compensa. */}
      <View style={{ transform: [{ rotate: `${flight.track - 45}deg` }] }}>
        <MaterialCommunityIcons name="airplane" size={size} color={color} />
      </View>
    </Marker>
  );
}

function FlightCard({ flight, favorite, onClose }: { flight: Flight; favorite: boolean; onClose: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>
          {flight.callsign}
          {favorite ? <Text style={styles.cardFav}>  ★ favorito</Text> : null}
        </Text>
        <Pressable onPress={onClose} hitSlop={10}>
          <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.cardLine}>{[flight.typeLabel ?? flight.type, flight.registration, flight.operator].filter(Boolean).join('  ·  ')}</Text>
      <Text style={styles.cardLine}>
        {formatAltitude(flight.altitudeFt)}  ·  {Math.round(flight.speedKt * 1.852)} km/h  ·  a {Math.round(flight.distanceKm)} km
      </Text>
      {flight.arriving ? (
        <Text style={styles.cardEta}>
          Llega en unos {flight.etaMin} min{flight.origin ? ` · desde ${flight.origin}` : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  airport: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 2, borderColor: colors.surface },
  airportText: { color: colors.primaryText, fontWeight: '700', fontSize: 12 },
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: 14,
    gap: 4,
    shadowColor: '#23313F',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  cardFav: { fontSize: 14, fontWeight: '500', color: colors.favorite },
  cardLine: { fontSize: 14, color: colors.textMuted },
  cardEta: { fontSize: 15, fontWeight: '600', color: colors.primary, marginTop: 4 },
});
