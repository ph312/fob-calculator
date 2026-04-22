import type { ContainerBodyTypeId } from "./containerBodyTypes";

export type PeriodId = "jan" | "feb_mar" | "mar" | "apr";

export const PERIOD_OPTIONS: { id: PeriodId; label: string }[] = [
  { id: "jan", label: "Январь" },
  { id: "feb_mar", label: "Февраль — Март" },
  { id: "mar", label: "Март" },
  { id: "apr", label: "Апрель" },
];

/** В упрощённом калькуляторе период не выбирается — всегда тариф апреля. */
export const CONTAINER_TARIFF_PERIOD: PeriodId = "apr";

/** Варианты состава только для типа кузова «Минивэн». */
export type MinivanCompositionId =
  | "double_two_notes"
  | "one_aqua_one_note"
  | "with_aqua"
  | "on_comp5";

export const MINIVAN_COMPOSITION_OPTIONS: { id: MinivanCompositionId; label: string }[] = [
  { id: "double_two_notes", label: "двойная доплата с 2 нотами" },
  { id: "one_aqua_one_note", label: "с 1 аквой и 1 нотой" },
  { id: "with_aqua", label: "с аквой" },
  { id: "on_comp5", label: "с авто на состав 5" },
];

const MINIVAN_RATES: Record<MinivanCompositionId, Record<PeriodId, number>> = {
  double_two_notes: { jan: 1750, feb_mar: 1645, mar: 1820, apr: 1750 },
  one_aqua_one_note: { jan: 1583, feb_mar: 1488, mar: 1647, apr: 1583 },
  with_aqua: { jan: 1666, feb_mar: 1566, mar: 1733, apr: 1666 },
  on_comp5: { jan: 1500, feb_mar: 1410, mar: 1560, apr: 1500 },
};

/** Фиксированный состав (подпись) для типов кузова, кроме минивэна. */
export const FIXED_COMPOSITION_LABEL: Record<Exclude<ContainerBodyTypeId, "minivan">, string> = {
  short_minivan_hatchback_bongo: "4",
  sedan_over_460: "4",
  hatchback: "5",
  small_car_truck: "6",
};

const SIMPLE_RATES: Record<Exclude<ContainerBodyTypeId, "minivan">, Record<PeriodId, number>> = {
  short_minivan_hatchback_bongo: { jan: 1250, feb_mar: 1175, mar: 1300, apr: 1250 },
  sedan_over_460: { jan: 1250, feb_mar: 1175, mar: 1300, apr: 1250 },
  hatchback: { jan: 1000, feb_mar: 940, mar: 1040, apr: 1000 },
  small_car_truck: { jan: 834, feb_mar: 784, mar: 867, apr: 834 },
};

/** Стоимость контейнера (USD) или null, если не хватает выбора. */
export function getContainerUsd(
  bodyTypeId: ContainerBodyTypeId | null,
  periodId: PeriodId | null,
  minivanCompositionId: MinivanCompositionId | null,
): number | null {
  if (!bodyTypeId || !periodId) return null;

  if (bodyTypeId === "minivan") {
    if (!minivanCompositionId) return null;
    return MINIVAN_RATES[minivanCompositionId][periodId];
  }

  return SIMPLE_RATES[bodyTypeId][periodId];
}

/** Подпись состава для блока результата. */
export function getCompositionResultLabel(
  bodyTypeId: ContainerBodyTypeId | null,
  minivanCompositionId: MinivanCompositionId | null,
): string | null {
  if (!bodyTypeId) return null;
  if (bodyTypeId === "minivan") {
    if (!minivanCompositionId) return null;
    return MINIVAN_COMPOSITION_OPTIONS.find((o) => o.id === minivanCompositionId)?.label ?? null;
  }
  return FIXED_COMPOSITION_LABEL[bodyTypeId];
}

export function isContainerSelectionComplete(
  bodyTypeId: ContainerBodyTypeId | null,
  periodId: PeriodId | null,
  minivanCompositionId: MinivanCompositionId | null,
): boolean {
  return getContainerUsd(bodyTypeId, periodId, minivanCompositionId) !== null;
}
