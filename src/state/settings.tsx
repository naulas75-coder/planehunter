import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { AIRCRAFT_GROUPS } from '../data/aircraftTypes';
import { DEFAULT_AIRPORT, findAirport, type Airport } from '../data/airports';

const KEY = 'planehunter.settings.v1';

type Stored = { airport: string; favorites: string[] };

type Settings = {
  ready: boolean;
  airport: Airport;
  favorites: string[]; // ids de AIRCRAFT_GROUPS
  favoriteCodes: Set<string>;
  setAirport: (icao: string) => void;
  toggleFavorite: (groupId: string) => void;
};

const Ctx = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [stored, setStored] = useState<Stored>({ airport: DEFAULT_AIRPORT.icao, favorites: ['a380', 'b747', 'a350', 'b787'] });

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setStored((s) => ({ ...s, ...JSON.parse(raw) })))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const save = (next: Stored) => {
    setStored(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  };

  const value = useMemo<Settings>(() => {
    const favoriteCodes = new Set<string>();
    for (const g of AIRCRAFT_GROUPS) if (stored.favorites.includes(g.id)) g.codes.forEach((c) => favoriteCodes.add(c));
    return {
      ready,
      airport: findAirport(stored.airport),
      favorites: stored.favorites,
      favoriteCodes,
      setAirport: (icao) => save({ ...stored, airport: icao }),
      toggleFavorite: (id) =>
        save({
          ...stored,
          favorites: stored.favorites.includes(id) ? stored.favorites.filter((f) => f !== id) : [...stored.favorites, id],
        }),
    };
  }, [ready, stored]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useSettings fuera de SettingsProvider');
  return s;
}
