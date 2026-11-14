import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { fetchRoute, type Flight } from '../api/traffic';
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
            key={`${f.id}-${f.id === selectedId ? 's' : 'n'}`}
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
  const color = selected ? colors.selected : favorite ? colors.favorite : colors.plane;
  const size = selected ? 38 : favorite ? 30 : 20;
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
        {selected ? (
          // Contorno oscuro para que el amarillo se vea sobre el mapa claro.
          <View>
            <MaterialCommunityIcons name="airplane" size={size + 4} color={colors.selectedBorder} style={{ position: 'absolute', left: -2, top: -2 }} />
            <MaterialCommunityIcons name="airplane" size={size} color={color} />
          </View>
        ) : (
          <MaterialCommunityIcons name="airplane" size={size} color={color} />
        )}
      </View>
    </Marker>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function place(code?: string, name?: string) {
  if (!code) return undefined;
  return name ? `${name} (${code})` : code;
}

function FlightCard({ flight, favorite, onClose }: { flight: Flight; favorite: boolean; onClose: () => void }) {
  // Si la ruta no vino con los datos (solo se pide para favoritos), se pide al abrir la ficha.
  const [route, setRoute] = useState<Pick<Flight, 'origin' | 'destination' | 'originName' | 'destinationName'>>({});
  useEffect(() => {
    setRoute({});
    if (flight.destination || flight.callsign === '—') return;
    let alive = true;
    fetchRoute(flight).then((r) => alive && r && setRoute(r)).catch(() => {});
    return () => {
      alive = false;
    };
  }, [flight.id]);

  const origin = flight.origin ?? route.origin;
  const destination = flight.destination ?? route.destination;
  const vertical = Math.round(flight.verticalFpm);
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
      {flight.arriving ? <Text style={styles.cardEta}>Llega en unos {flight.etaMin} min</Text> : null}
      <ScrollView style={styles.rows}>
        <Row label="Modelo" value={flight.model ?? flight.typeLabel} />
        <Row label="Código de tipo" value={flight.type} />
        <Row label="Matrícula" value={flight.registration} />
        <Row label="Operador" value={flight.operator} />
        <Row label="Año de fabricación" value={flight.year} />
        <Row label="Origen" value={place(origin, flight.originName ?? route.originName)} />
        <Row label="Destino" value={place(destination, flight.destinationName ?? route.destinationName)} />
        <Row label="Altitud" value={formatAltitude(flight.altitudeFt)} />
        <Row label="Velocidad" value={`${Math.round(flight.speedKt * 1.852)} km/h (${Math.round(flight.speedKt)} nudos)`} />
        <Row
          label="Vel. vertical"
          value={vertical === 0 ? 'Nivelado' : `${vertical > 0 ? 'Subiendo' : 'Bajando'} ${Math.abs(vertical)} ft/min`}
        />
        <Row label="Rumbo" value={`${Math.round(flight.track)}°`} />
        <Row label="Distancia al aeropuerto" value={`${Math.round(flight.distanceKm)} km`} />
        <Row label="Squawk" value={flight.squawk} />
        <Row label="Código ICAO (transpondedor)" value={flight.id.toUpperCase()} />
      </ScrollView>
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
  cardEta: { fontSize: 15, fontWeight: '600', color: colors.primary, marginTop: 2 },
  rows: { maxHeight: 300, marginTop: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowLabel: { fontSize: 14, color: colors.textMuted },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
});
