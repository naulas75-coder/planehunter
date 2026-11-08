export type Airport = {
  icao: string;
  iata: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
};

// Aeropuertos disponibles. Se pueden añadir más en esta lista.
export const AIRPORTS: Airport[] = [
  { icao: 'LEBL', iata: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barcelona', lat: 41.2971, lon: 2.0785 },
  { icao: 'LEMD', iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', lat: 40.4719, lon: -3.5626 },
  { icao: 'LEPA', iata: 'PMI', name: 'Palma de Mallorca', city: 'Palma', lat: 39.5517, lon: 2.7388 },
  { icao: 'LEMG', iata: 'AGP', name: 'Málaga-Costa del Sol', city: 'Málaga', lat: 36.6749, lon: -4.4991 },
  { icao: 'LEAL', iata: 'ALC', name: 'Alicante-Elche', city: 'Alicante', lat: 38.2822, lon: -0.5582 },
  { icao: 'LEVC', iata: 'VLC', name: 'Valencia', city: 'Valencia', lat: 39.4893, lon: -0.4816 },
  { icao: 'LEZL', iata: 'SVQ', name: 'Sevilla', city: 'Sevilla', lat: 37.418, lon: -5.8931 },
  { icao: 'LEBB', iata: 'BIO', name: 'Bilbao', city: 'Bilbao', lat: 43.3011, lon: -2.9106 },
  { icao: 'LEGE', iata: 'GRO', name: 'Girona-Costa Brava', city: 'Girona', lat: 41.9010, lon: 2.7605 },
  { icao: 'LERS', iata: 'REU', name: 'Reus', city: 'Reus', lat: 41.1474, lon: 1.1672 },
  { icao: 'LEIB', iata: 'IBZ', name: 'Ibiza', city: 'Ibiza', lat: 38.8729, lon: 1.3731 },
  { icao: 'LEMH', iata: 'MAH', name: 'Menorca', city: 'Mahón', lat: 39.8626, lon: 4.2186 },
  { icao: 'GCLP', iata: 'LPA', name: 'Gran Canaria', city: 'Las Palmas', lat: 27.9319, lon: -15.3866 },
  { icao: 'GCTS', iata: 'TFS', name: 'Tenerife Sur', city: 'Tenerife', lat: 28.0445, lon: -16.5725 },
  { icao: 'LEST', iata: 'SCQ', name: 'Santiago-Rosalía de Castro', city: 'Santiago', lat: 42.8963, lon: -8.4151 },
  { icao: 'LEZG', iata: 'ZAZ', name: 'Zaragoza', city: 'Zaragoza', lat: 41.6662, lon: -1.0415 },
  { icao: 'LPPT', iata: 'LIS', name: 'Humberto Delgado', city: 'Lisboa', lat: 38.7742, lon: -9.1342 },
  { icao: 'LFPG', iata: 'CDG', name: 'Charles de Gaulle', city: 'París', lat: 49.0097, lon: 2.5479 },
  { icao: 'EGLL', iata: 'LHR', name: 'Heathrow', city: 'Londres', lat: 51.47, lon: -0.4543 },
  { icao: 'EHAM', iata: 'AMS', name: 'Schiphol', city: 'Ámsterdam', lat: 52.3105, lon: 4.7683 },
  { icao: 'EDDF', iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', lat: 50.0379, lon: 8.5622 },
  { icao: 'LIRF', iata: 'FCO', name: 'Fiumicino', city: 'Roma', lat: 41.8003, lon: 12.2389 },
];

export const DEFAULT_AIRPORT = AIRPORTS[0];

export function findAirport(icao: string): Airport {
  return AIRPORTS.find((a) => a.icao === icao) ?? DEFAULT_AIRPORT;
}
