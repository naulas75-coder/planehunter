# PlaneHunter

App privada para iPhone para seguir aviones que llegan a tu aeropuerto.

- **Llegadas**: aviones que se acercan al aeropuerto elegido, con los minutos que faltan. Por defecto solo tus tipos favoritos.
- **Mapa**: todos los aviones de la zona en tiempo real; tus favoritos en azul más intenso. Toca uno para ver sus datos.
- **Ajustes**: aeropuerto y tipos de avión favoritos (se guardan en el móvil).

## Cómo funciona

- Datos en vivo de [adsb.lol](https://api.adsb.lol) (red ADS-B colaborativa, gratis y sin clave), en un radio de 200 millas náuticas, cada 15 s.
- Llegada confirmada si la ruta conocida del vuelo termina en tu aeropuerto; si no se conoce, se estima por rumbo, altitud y descenso.
- El tiempo estimado sale de la distancia y la velocidad, con un margen para la aproximación final.
- Expo (React Native). Código: `App.tsx` (pestañas), `src/screens/`, `src/api/traffic.ts`, `src/theme.ts` (colores).

## Compilar e instalar

Todo se hace en la nube con GitHub Actions y EAS (`.github/workflows/ios.yml`), sin Mac:

- Cambios de código en `main`: se publican como actualización y la app los carga al abrirse.
- Cambios de dependencias o `app.json`, o lanzando el workflow a mano: versión nueva para TestFlight.

Secretos de GitHub: `EXPO_TOKEN` (obligatorio). Opcionales: `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8`.

## Pendiente

- Diario de fotos por día.
- Avisos cuando se acerque un favorito.
