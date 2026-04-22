import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { parseFobCell, type FobValue } from "./fobValue";

const CSV_FILENAME = "GEORGIA FOB - NEW FOB from 01_04_2026.csv";

export type AuctionRecord = {
  auction: string;
  area: string;
  port: string;
  fobSmall: FobValue | null;
  fobMinivan: FobValue | null;
};

const COL = {
  auction: 0,
  area: 1,
  port: 2,
  minivan: 3,
  small: 4,
} as const;

function cell(row: string[], index: number): string | undefined {
  return row[index]?.trim();
}

function isLikelyHeader(row: string[]): boolean {
  return cell(row, COL.auction)?.toLowerCase() === "auction";
}

function isEmptyAuction(row: string[]): boolean {
  return !cell(row, COL.auction);
}

function normalizeRow(row: unknown[]): string[] {
  return row.map((c) => (c == null ? "" : String(c)));
}

/**
 * Отбираем строки аукционов: не пустые, не заголовок, с хотя бы одним FOB.
 */
function isAuctionDataRow(row: string[]): boolean {
  if (isEmptyAuction(row)) return false;
  if (isLikelyHeader(row)) return false;

  const fobSmall = parseFobCell(row[COL.small]);
  const fobMinivan = parseFobCell(row[COL.minivan]);
  return fobSmall !== null || fobMinivan !== null;
}

export function loadAuctionRecords(): AuctionRecord[] {
  const csvPath = path.join(process.cwd(), CSV_FILENAME);
  const text = fs.readFileSync(csvPath, "utf8");

  const parsed = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: "greedy",
  });

  if (parsed.errors.length > 0) {
    const message = parsed.errors.map((e) => e.message).join("; ");
    throw new Error(`Ошибка чтения CSV: ${message}`);
  }

  const rows = parsed.data.map(normalizeRow);
  const records: AuctionRecord[] = [];

  for (const row of rows) {
    if (!isAuctionDataRow(row)) continue;

    records.push({
      auction: cell(row, COL.auction) ?? "",
      area: cell(row, COL.area) ?? "",
      port: cell(row, COL.port) ?? "",
      fobSmall: parseFobCell(row[COL.small]),
      fobMinivan: parseFobCell(row[COL.minivan]),
    });
  }

  records.sort((a, b) => a.auction.localeCompare(b.auction, "ru"));

  return records;
}
