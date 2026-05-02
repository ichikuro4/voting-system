export const MESA_OPTIONS = [
  { mesaNumero: 1, mesaAula: "1AS", label: "1AS - Mesa 1" },
  { mesaNumero: 2, mesaAula: "1BS", label: "1BS - Mesa 2" },
  { mesaNumero: 3, mesaAula: "2AS", label: "2AS - Mesa 3" },
  { mesaNumero: 4, mesaAula: "2BS", label: "2BS - Mesa 4" },
  { mesaNumero: 5, mesaAula: "3AS", label: "3AS - Mesa 5" },
  { mesaNumero: 6, mesaAula: "3BS", label: "3BS - Mesa 6" },
  { mesaNumero: 7, mesaAula: "4TO", label: "4TO - Mesa 7" },
  { mesaNumero: 8, mesaAula: "5TO", label: "5TO - Mesa 8" },
];

export const MESA_AULA_TO_NUMERO = Object.freeze(
  Object.fromEntries(MESA_OPTIONS.map((mesa) => [mesa.mesaAula, mesa.mesaNumero]))
);

export function normalizeMesaAula(value) {
  return String(value || "").trim().toUpperCase();
}

export function getMesaOptionByAula(mesaAula) {
  const normalizedMesaAula = normalizeMesaAula(mesaAula);
  return MESA_OPTIONS.find((mesa) => mesa.mesaAula === normalizedMesaAula) || null;
}

export function isValidMesaPair(mesaNumero, mesaAula) {
  const normalizedMesaNumero = Number(mesaNumero);
  const normalizedMesaAula = normalizeMesaAula(mesaAula);

  return (
    Number.isInteger(normalizedMesaNumero) &&
    normalizedMesaNumero > 0 &&
    MESA_AULA_TO_NUMERO[normalizedMesaAula] === normalizedMesaNumero
  );
}
