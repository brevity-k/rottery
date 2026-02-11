import { LotteryConfig, DrawResult, LotteryData } from '@/lib/lotteries/types';
import { parseSodaResponse } from '@/lib/data/parser';
import fs from 'fs';
import path from 'path';

/**
 * Fetches lottery draw data from the NY Open Data SODA API.
 * Retrieves up to 50,000 records ordered by draw date descending.
 */
export async function fetchLotteryData(config: LotteryConfig): Promise<DrawResult[]> {
  const baseUrl = config.dataSource.url;
  const separator = baseUrl.includes('?') ? '&' : '?';
  const url = `${baseUrl}${separator}$limit=50000&$order=draw_date DESC`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch lottery data for ${config.name}: ${response.status} ${response.statusText}`
    );
  }

  const rawData = await response.json();

  if (!Array.isArray(rawData)) {
    throw new Error(`Unexpected response format for ${config.name}: expected an array`);
  }

  const draws = parseSodaResponse(rawData, config);

  return draws;
}

/**
 * Loads lottery data from a local JSON file at build time.
 * Reads from src/data/{lotterySlug}.json.
 */
export function loadLotteryData(lotterySlug: string): LotteryData {
  const filePath = path.join(process.cwd(), 'src', 'data', `${lotterySlug}.json`);

  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const data: LotteryData = JSON.parse(fileContents);

  return data;
}
