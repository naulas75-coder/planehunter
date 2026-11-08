import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { fetchTraffic, type Flight } from '../api/traffic';
import { useSettings } from './settings';

const REFRESH_MS = 15000;

type Traffic = {
  flights: Flight[];
  loading: boolean;
  error: string | null;
  updatedAt: Date | null;
  refresh: () => void;
};

const Ctx = createContext<Traffic | null>(null);

// Lee los vuelos cerca del aeropuerto cada 15 s mientras la app está abierta.
export function TrafficProvider({ children }: { children: ReactNode }) {
  const { airport, favoriteCodes, ready } = useSettings();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const reqId = useRef(0);

  const refresh = useCallback(() => {
    const id = ++reqId.current;
    setLoading(true);
    fetchTraffic(airport, favoriteCodes)
      .then((f) => {
        if (id !== reqId.current) return;
        setFlights(f);
        setError(null);
        setUpdatedAt(new Date());
      })
      .catch((e: unknown) => id === reqId.current && setError(e instanceof Error ? e.message : 'Sin conexión'))
      .finally(() => id === reqId.current && setLoading(false));
  }, [airport, favoriteCodes]);

  useEffect(() => {
    if (!ready) return;
    setFlights([]);
    refresh();
    let timer: ReturnType<typeof setInterval> | null = setInterval(refresh, REFRESH_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
        if (!timer) timer = setInterval(refresh, REFRESH_MS);
      } else if (timer) {
        clearInterval(timer);
        timer = null;
      }
    });
    return () => {
      if (timer) clearInterval(timer);
      sub.remove();
    };
  }, [ready, refresh]);

  return <Ctx.Provider value={{ flights, loading, error, updatedAt, refresh }}>{children}</Ctx.Provider>;
}

export function useTraffic() {
  const t = useContext(Ctx);
  if (!t) throw new Error('useTraffic fuera de TrafficProvider');
  return t;
}
