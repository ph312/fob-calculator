export type FobValue =
  | { kind: "numeric"; amount: number }
  | { kind: "text"; text: string };

/** Парсит ячейку FOB: числа без «$», текст — как есть (например «по факту»). */
export function parseFobCell(raw: string | undefined): FobValue | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withoutDollar = trimmed.replace(/\$/g, "").replace(/\u00a0/g, " ").trim();
  if (!withoutDollar) return null;

  const normalizedNumber = withoutDollar.replace(/\s/g, "").replace(/,/g, ".");
  if (/^-?\d+(\.\d+)?$/.test(normalizedNumber)) {
    const amount = Number(normalizedNumber);
    if (Number.isFinite(amount)) {
      return { kind: "numeric", amount };
    }
  }

  return { kind: "text", text: withoutDollar };
}

export function formatFobDisplay(value: FobValue): string {
  if (value.kind === "numeric") {
    return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value.amount);
  }
  return value.text;
}
