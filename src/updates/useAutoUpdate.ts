import * as Updates from 'expo-updates';
import { useEffect } from 'react';

// En la app instalada (TestFlight), al abrirla busca si hay cambios publicados y, si los hay, los carga
// en el momento en vez de esperar a la siguiente vez que se abra. En Expo Go no hace nada.
export function useAutoUpdate() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;
    (async () => {
      const check = await Updates.checkForUpdateAsync();
      if (!check.isAvailable) return;
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    })().catch(() => {
      // Sin conexión o fallo del servidor: seguimos con la versión que hay.
    });
  }, []);
}
