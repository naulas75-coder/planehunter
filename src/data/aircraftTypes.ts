// Tipos de avión agrupados por familia. `codes` son los códigos ICAO que emiten los transpondedores.
export type AircraftGroup = { id: string; label: string; maker: string; codes: string[] };

export const AIRCRAFT_GROUPS: AircraftGroup[] = [
  { id: 'a220', maker: 'Airbus', label: 'A220', codes: ['BCS1', 'BCS3'] },
  { id: 'a320', maker: 'Airbus', label: 'A318 / A319 / A320', codes: ['A318', 'A319', 'A320'] },
  { id: 'a321', maker: 'Airbus', label: 'A321', codes: ['A321'] },
  { id: 'a320neo', maker: 'Airbus', label: 'A319neo / A320neo / A321neo', codes: ['A19N', 'A20N', 'A21N'] },
  { id: 'a330', maker: 'Airbus', label: 'A330', codes: ['A332', 'A333', 'A338', 'A339'] },
  { id: 'a340', maker: 'Airbus', label: 'A340', codes: ['A342', 'A343', 'A345', 'A346'] },
  { id: 'a350', maker: 'Airbus', label: 'A350', codes: ['A359', 'A35K'] },
  { id: 'a380', maker: 'Airbus', label: 'A380', codes: ['A388'] },
  { id: 'beluga', maker: 'Airbus', label: 'Beluga', codes: ['A3ST', 'A337'] },
  { id: 'b737', maker: 'Boeing', label: '737 clásico / NG', codes: ['B733', 'B734', 'B735', 'B736', 'B737', 'B738', 'B739'] },
  { id: 'b737max', maker: 'Boeing', label: '737 MAX', codes: ['B37M', 'B38M', 'B39M', 'B3XM'] },
  { id: 'b747', maker: 'Boeing', label: '747', codes: ['B741', 'B742', 'B743', 'B744', 'B748', 'B74S'] },
  { id: 'b757', maker: 'Boeing', label: '757', codes: ['B752', 'B753'] },
  { id: 'b767', maker: 'Boeing', label: '767', codes: ['B762', 'B763', 'B764'] },
  { id: 'b777', maker: 'Boeing', label: '777', codes: ['B772', 'B773', 'B77L', 'B77W', 'B778', 'B779'] },
  { id: 'b787', maker: 'Boeing', label: '787 Dreamliner', codes: ['B788', 'B789', 'B78X'] },
  { id: 'e-jet', maker: 'Embraer', label: 'E170 / E175 / E190 / E195', codes: ['E170', 'E75S', 'E75L', 'E190', 'E195', 'E290', 'E295'] },
  { id: 'crj', maker: 'Bombardier', label: 'CRJ', codes: ['CRJ2', 'CRJ7', 'CRJ9', 'CRJX'] },
  { id: 'atr', maker: 'ATR', label: 'ATR 42 / 72', codes: ['AT43', 'AT45', 'AT46', 'AT72', 'AT75', 'AT76'] },
  { id: 'dash8', maker: 'De Havilland', label: 'Dash 8', codes: ['DH8A', 'DH8B', 'DH8C', 'DH8D'] },
  { id: 'an124', maker: 'Antonov', label: 'An-124 / An-225', codes: ['A124', 'A225'] },
];

const byCode = new Map<string, AircraftGroup>();
for (const g of AIRCRAFT_GROUPS) for (const c of g.codes) byCode.set(c, g);

export function groupForType(code?: string): AircraftGroup | undefined {
  return code ? byCode.get(code.toUpperCase()) : undefined;
}
