import type { Airport } from '../data/airports';
import { groupForType } from '../data/aircraftTypes';

// Datos en vivo de adsb.lol (red ADS-B colaborativa, gratis y sin clave).
const API = 'https://api.adsb.lol';
// Radio de búsqueda alrededor del aeropuerto, en millas náuticas (máximo de la API: 250).
const RADIUS_NM = 200;

type RawAircraft = {
  hex: string;
  flight?: string;
  r?: string;
  t?: string;
  desc?: string;
  ownOp?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | 'ground';
  gs?: number;
  track?: number;
  baro_rate?: number;
};

export type Flight = {
  id: string;
  callsign: string;
  registration?: string;
  type?: string;
  typeLabel?: string;
  operator?: string;
  lat: number;
  lon: number;
  altitudeFt: number | null; // null = en tierra
  speedKt: number;
  track: number;
  verticalFpm: number;
  distanceKm: number;
  // Llegando al aeropuerto elegido (por ruta conocida o por rumbo y descenso).
  arriving: boolean;
  routeConfirmed: boolean;
  origin?: string;
  etaMin?: number;
};

const toRad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number) {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function angleDiff(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// Sin ruta conocida: va hacia el aeropuerto y está bajando o ya bajo y cerca.
function looksLikeArrival(f: Flight, airport: Airport) {
  if (f.altitudeFt === null || f.speedKt < 80) return false;
  const toAirport = bearingDeg(f.lat, f.lon, airport.lat, airport.lon);
  if (f.distanceKm > 8 && angleDiff(f.track, toAirport) > 35) return false;
  if (f.distanceKm < 60) return f.altitudeFt < 12000;
  return f.verticalFpm < -400 && f.altitudeFt < 30000;
}

function etaMinutes(f: Flight) {
  if (f.speedKt <= 0) return undefined;
  // Tramo final más lento: se añaden unos minutos de margen.
  const hours = f.distanceKm / 1.852 / f.speedKt;
  return Math.max(1, Math.round(hours * 60 * 1.15 + 3));
}

type RouteInfo = { origin?: string; destination?: string };

async function fetchRoutes(planes: Flight[]): Promise<Map<string, RouteInfo>> {
  const out = new Map<string, RouteInfo>();
  const withCallsign = planes.filter((p) => p.callsign && p.callsign !== '—');
  if (withCallsign.length === 0) return out;
  try {
    const res = await fetch(`${API}/api/0/routeset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planes: withCallsign.map((p) => ({ callsign: p.callsign, lat: p.lat, lng: p.lon })) }),
    });
    if (!res.ok) return out;
    const data = (await res.json()) as { callsign?: string; airport_codes?: string; plausible?: boolean | number }[];
    for (const r of data ?? []) {
      if (!r.callsign || !r.airport_codes || r.airport_codes === 'unknown' || !r.plausible) continue;
      const codes = r.airport_codes.split('-');
      out.set(r.callsign, { origin: codes[0], destination: codes[codes.length - 1] });
    }
  } catch {
    // Sin rutas: se usa solo el rumbo.
  }
  return out;
}

export async function fetchTraffic(airport: Airport, favoriteCodes: Set<string>): Promise<Flight[]> {
  const res = await fetch(`${API}/v2/point/${airport.lat}/${airport.lon}/${RADIUS_NM}`);
  if (!res.ok) throw new Error(`Error ${res.status} al leer los vuelos`);
  const data = (await res.json()) as { ac?: RawAircraft[] };

  const flights: Flight[] = [];
  for (const a of data.ac ?? []) {
    if (a.lat == null || a.lon == null) continue;
    const onGround = a.alt_baro === 'ground';
    const f: Flight = {
      id: a.hex,
      callsign: a.flight?.trim() || '—',
      registration: a.r,
      type: a.t,
      typeLabel: groupForType(a.t)?.label ?? a.desc,
      operator: a.ownOp,
      lat: a.lat,
      lon: a.lon,
      altitudeFt: onGround ? null : typeof a.alt_baro === 'number' ? a.alt_baro : null,
      speedKt: a.gs ?? 0,
      track: a.track ?? 0,
      verticalFpm: a.baro_rate ?? 0,
      distanceKm: distanceKm(a.lat, a.lon, airport.lat, airport.lon),
      arriving: false,
      routeConfirmed: false,
    };
    flights.push(f);
  }

  // Rutas solo para los favoritos (menos peticiones).
  const favorites = flights.filter((f) => f.type && favoriteCodes.has(f.type));
  const routes = await fetchRoutes(favorites);

  for (const f of flights) {
    const route = routes.get(f.callsign);
    if (route?.destination) {
      f.origin = route.origin;
      f.routeConfirmed = route.destination === airport.icao;
      f.arriving = f.routeConfirmed && f.altitudeFt !== null;
    } else {
      f.arriving = looksLikeArrival(f, airport);
    }
    if (f.arriving) f.etaMin = etaMinutes(f);
  }
  return flights;
}
