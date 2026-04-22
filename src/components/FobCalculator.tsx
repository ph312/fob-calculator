"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CONTAINER_BODY_TYPE_OPTIONS,
  type ContainerBodyTypeId,
} from "@/lib/containerBodyTypes";
import {
  CONTAINER_TARIFF_PERIOD,
  FIXED_COMPOSITION_LABEL,
  MINIVAN_COMPOSITION_OPTIONS,
  getContainerUsd,
  type MinivanCompositionId,
} from "@/lib/containerRates";
import type { AuctionRecord } from "@/lib/loadFobCsv";
import type { FobValue } from "@/lib/fobValue";
import { formatFobDisplay } from "@/lib/fobValue";

type Category = "sedan" | "minivan";

/** Тип кузова контейнера для сценария «седан / хэтчбек / кроссовер». */
type SedanContainerBodyId = Exclude<ContainerBodyTypeId, "minivan">;

type Props = {
  auctions: AuctionRecord[];
};

type RadioAccent = "sky" | "emerald";

function formatMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n);
}

function fobCategoryLabel(cat: Category): string {
  return cat === "sedan" ? "Седан / хэтчбек / кроссовер" : "Минивэн / большой седан";
}

const SEDAN_CONTAINER_OPTIONS: { id: SedanContainerBodyId; label: string }[] = [
  { id: "short_minivan_hatchback_bongo", label: "Минивэн короткий / Bongo / Vanette" },
  { id: "sedan_over_460", label: "Седаны длиннее 460 см" },
  { id: "hatchback", label: "Хэтчбеки" },
  { id: "small_car_truck", label: "Малолитражки / SMALL TRUCKS" },
];

function RadioSelectGroup<T extends string>({
  name,
  title,
  value,
  onChange,
  options,
  accent,
}: {
  name: string;
  title: string;
  value: T | null;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  accent: RadioAccent;
}) {
  const active =
    accent === "sky"
      ? "border-sky-500 bg-sky-500/15 text-white ring-2 ring-sky-400/55"
      : "border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-400/50";
  const idle =
    "border-slate-600 bg-[var(--surface)] text-slate-200 hover:border-slate-500 hover:bg-[var(--surface-hover)]";

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-300">{title}</legend>
      <p className="text-xs text-slate-500">Выберите один вариант</p>
      <div className="mt-2 flex flex-col gap-2">
        {options.map((opt) => {
          const checked = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] font-semibold leading-snug transition ${
                checked ? active : idle
              }`}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                className={`shrink-0 pt-0.5 font-mono text-base ${checked ? "text-white" : "text-slate-500"}`}
                aria-hidden
              >
                {checked ? "●" : "○"}
              </span>
              <span className="pt-0.5">{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function buildShareText(params: {
  auction: string;
  categoryLabel: string;
  fob: FobValue | null;
  containerUsd: number | null;
  containerComplete: boolean;
  totalNumeric: number | null;
}): string {
  const fobLine =
    params.fob == null
      ? "FOB: нет данных"
      : params.fob.kind === "numeric"
        ? `FOB: ${formatMoney(params.fob.amount)} USD`
        : `FOB: ${formatFobDisplay(params.fob)}`;

  const containerLine =
    params.containerUsd !== null
      ? `Контейнер (апрель): ${formatMoney(params.containerUsd)} USD`
      : "Контейнер (апрель): не выбран";

  let itogoLine: string;
  if (params.totalNumeric !== null) {
    itogoLine = `Итого: ${formatMoney(params.totalNumeric)} USD`;
  } else if (params.fob?.kind === "text" && params.containerComplete) {
    itogoLine = "Итого: Итого рассчитывается по факту";
  } else {
    itogoLine = "Итого: —";
  }

  return [
    `Аукцион: ${params.auction}`,
    `Категория: ${params.categoryLabel}`,
    fobLine,
    containerLine,
    itogoLine,
  ].join("\n");
}

export function FobCalculator({ auctions }: Props) {
  const [auctionKey, setAuctionKey] = useState<string>(() => auctions[0]?.auction ?? "");
  const [category, setCategory] = useState<Category>("sedan");
  const [minivanCompositionId, setMinivanCompositionId] = useState<MinivanCompositionId | null>(
    null,
  );
  const [sedanBodyTypeId, setSedanBodyTypeId] = useState<SedanContainerBodyId | null>(null);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const selected = useMemo(
    () => auctions.find((a) => a.auction === auctionKey) ?? null,
    [auctions, auctionKey],
  );

  const fob = useMemo(() => {
    if (!selected) return null;
    return category === "sedan" ? selected.fobSmall : selected.fobMinivan;
  }, [selected, category]);

  const containerBodyTypeId: ContainerBodyTypeId | null = useMemo(() => {
    if (category === "minivan") return "minivan";
    return sedanBodyTypeId;
  }, [category, sedanBodyTypeId]);

  const containerUsd = useMemo(() => {
    return getContainerUsd(
      containerBodyTypeId,
      CONTAINER_TARIFF_PERIOD,
      category === "minivan" ? minivanCompositionId : null,
    );
  }, [containerBodyTypeId, category, minivanCompositionId]);

  const containerComplete = useMemo(() => {
    if (category === "minivan") return minivanCompositionId !== null;
    return sedanBodyTypeId !== null;
  }, [category, minivanCompositionId, sedanBodyTypeId]);

  const totalNumeric = useMemo(() => {
    if (!containerComplete || containerUsd === null) return null;
    if (fob?.kind !== "numeric") return null;
    return fob.amount + containerUsd;
  }, [containerComplete, containerUsd, fob]);

  const categoryLabel = useMemo(() => fobCategoryLabel(category), [category]);

  const shareText = useMemo(() => {
    if (!selected) return "";
    return buildShareText({
      auction: selected.auction,
      categoryLabel,
      fob,
      containerUsd,
      containerComplete,
      totalNumeric,
    });
  }, [selected, categoryLabel, fob, containerUsd, containerComplete, totalNumeric]);

  const modelHintBodyId = useMemo((): ContainerBodyTypeId | null => {
    if (category === "minivan") return "minivan";
    return sedanBodyTypeId;
  }, [category, sedanBodyTypeId]);

  const modelHintText = useMemo(() => {
    if (!modelHintBodyId) return null;
    return CONTAINER_BODY_TYPE_OPTIONS.find((o) => o.id === modelHintBodyId)?.inclusion ?? null;
  }, [modelHintBodyId]);

  const onCategoryChange = useCallback((next: Category) => {
    setCategory(next);
    setMinivanCompositionId(null);
    setSedanBodyTypeId(null);
  }, []);

  const onCopy = useCallback(async () => {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopyHint("Скопировано в буфер");
      window.setTimeout(() => setCopyHint(null), 2000);
    } catch {
      setCopyHint("Не удалось скопировать");
      window.setTimeout(() => setCopyHint(null), 2500);
    }
  }, [shareText]);

  const hasAuctions = auctions.length > 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-7 px-4 py-10 sm:px-6">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-sm font-medium uppercase tracking-wider text-sky-300/90">
          Грузия · FOB из CSV
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Калькулятор FOB
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-400">
          Аукцион и категория — сразу виден FOB. Контейнер — один шаг: состав или тип кузова.
        </p>
      </header>

      {!hasAuctions ? (
        <p className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100">
          В CSV не найдено ни одной строки аукциона. Проверьте файл в корне проекта.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-600/80" aria-hidden />
            <h2 className="shrink-0 text-sm font-semibold uppercase tracking-wider text-sky-300/90">
              FOB
            </h2>
            <span className="h-px flex-1 bg-slate-600/80" aria-hidden />
          </div>

          <section className="space-y-3 rounded-2xl border border-slate-700/80 bg-[var(--surface)]/90 p-5 shadow-xl shadow-black/20 backdrop-blur sm:p-6">
            <label className="block text-sm font-medium text-slate-300" htmlFor="auction">
              Аукцион
            </label>
            <select
              id="auction"
              className="h-14 w-full cursor-pointer rounded-xl border border-slate-600 bg-slate-900/80 px-4 text-lg text-white outline-none ring-sky-500/40 transition focus:border-sky-500 focus:ring-4"
              value={auctionKey}
              onChange={(e) => setAuctionKey(e.target.value)}
            >
              {auctions.map((a) => (
                <option key={a.auction} value={a.auction}>
                  {a.auction}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-700/80 bg-[var(--surface)]/90 p-5 shadow-lg backdrop-blur sm:p-6">
            <RadioSelectGroup
              name="fob_category"
              title="Категория авто"
              value={category}
              onChange={onCategoryChange}
              accent="sky"
              options={[
                { value: "sedan" as const, label: "Седан / хэтчбек / кроссовер (до 13,5 м³)" },
                { value: "minivan" as const, label: "Минивэн / большой седан (свыше 13,5 м³)" },
              ]}
            />

            <div className="mt-4 rounded-xl border border-slate-600/80 bg-slate-900/70 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-sky-300/80">FOB</p>
              <p className="mt-1 text-xl font-bold text-sky-100">
                {fob ? (
                  fob.kind === "numeric" ? (
                    <>
                      {formatFobDisplay(fob)}{" "}
                      <span className="text-sm font-normal text-slate-400">USD</span>
                    </>
                  ) : (
                    <span className="text-amber-100">{formatFobDisplay(fob)}</span>
                  )
                ) : (
                  <span className="text-slate-500">нет данных</span>
                )}
              </p>
            </div>
          </section>

          <div className="flex items-center gap-3 pt-1">
            <span className="h-px flex-1 bg-slate-600/80" aria-hidden />
            <h2 className="shrink-0 text-sm font-semibold uppercase tracking-wider text-emerald-300/90">
              Контейнер
            </h2>
            <span className="h-px flex-1 bg-slate-600/80" aria-hidden />
          </div>

          <section className="space-y-4 rounded-2xl border border-slate-700/80 bg-[var(--surface)]/90 p-5 shadow-lg backdrop-blur sm:p-6">
            {category === "minivan" ? (
              <RadioSelectGroup
                name="minivan_composition"
                title="Состав (минивэн)"
                value={minivanCompositionId}
                onChange={(v) => setMinivanCompositionId(v)}
                accent="emerald"
                options={MINIVAN_COMPOSITION_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
              />
            ) : (
              <>
                <RadioSelectGroup
                  name="sedan_container_body"
                  title="Тип кузова для контейнера"
                  value={sedanBodyTypeId}
                  onChange={(v) => setSedanBodyTypeId(v)}
                  accent="emerald"
                  options={SEDAN_CONTAINER_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
                />
                {sedanBodyTypeId ? (
                  <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-100">
                    Состав:{" "}
                    <span className="font-bold text-white">
                      {FIXED_COMPOSITION_LABEL[sedanBodyTypeId]}
                    </span>{" "}
                    авто в контейнере
                  </p>
                ) : null}
              </>
            )}

            {modelHintBodyId && modelHintText ? (
              <div className="rounded-lg border border-emerald-500/35 bg-emerald-950/40 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200/95">
                  ПОДСКАЗКА ПО МОДЕЛЯМ (СПРАВОЧНО)
                </p>
                <p className="mt-1 max-h-24 overflow-y-auto text-xs leading-snug text-emerald-50/95">
                  {modelHintText}
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-600/80 bg-gradient-to-b from-slate-800/90 to-slate-900/95 p-5 shadow-xl sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Результат</h2>
            {!selected ? (
              <p className="text-slate-400">Выберите аукцион из списка.</p>
            ) : (
              <>
                <dl className="space-y-3.5 text-[15px]">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                    <dt className="text-slate-400">Аукцион</dt>
                    <dd className="text-right font-semibold text-white">{selected.auction}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                    <dt className="text-slate-400">Категория авто</dt>
                    <dd className="text-right font-medium text-slate-100">{categoryLabel}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                    <dt className="text-slate-400">FOB</dt>
                    <dd className="text-right font-semibold text-sky-200">
                      {fob ? (
                        fob.kind === "numeric" ? (
                          <span>
                            {formatFobDisplay(fob)}{" "}
                            <span className="text-xs font-normal text-slate-400">USD</span>
                          </span>
                        ) : (
                          <span className="text-amber-100">{formatFobDisplay(fob)}</span>
                        )
                      ) : (
                        <span className="text-slate-500">нет данных</span>
                      )}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                    <dt className="text-slate-400">Контейнер (апрель)</dt>
                    <dd className="text-right font-semibold text-emerald-200">
                      {containerUsd !== null ? (
                        <>
                          {formatMoney(containerUsd)}{" "}
                          <span className="text-xs font-normal text-slate-400">USD</span>
                        </>
                      ) : (
                        <span className="text-slate-500">не выбран</span>
                      )}
                    </dd>
                  </div>
                  <div className="border-t border-slate-600/80 pt-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                      <dt className="text-lg font-medium text-slate-200">Итого</dt>
                      <dd className="text-2xl font-bold text-emerald-300 sm:text-right">
                        {totalNumeric !== null ? (
                          <>
                            {formatMoney(totalNumeric)}{" "}
                            <span className="text-base font-normal text-slate-400">USD</span>
                          </>
                        ) : fob?.kind === "text" && containerComplete ? (
                          <span className="text-base font-semibold text-amber-100">
                            Итого рассчитывается по факту
                          </span>
                        ) : fob?.kind === "numeric" && !containerComplete ? (
                          <span className="text-base font-normal text-slate-400">
                            Выберите вариант контейнера
                          </span>
                        ) : (
                          <span className="text-base font-normal text-slate-500">—</span>
                        )}
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={onCopy}
                    disabled={!shareText}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-500 bg-slate-800/80 px-4 text-sm font-semibold text-white transition hover:border-slate-400 hover:bg-slate-700/80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span aria-hidden>📋</span>
                    Скопировать
                  </button>
                </div>
                {copyHint ? (
                  <p className="mt-2 text-center text-xs text-slate-400">{copyHint}</p>
                ) : null}
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}
