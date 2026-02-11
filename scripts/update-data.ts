/**
 * Data update script - fetches latest lottery data from SODA API
 * Run: npx tsx scripts/update-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface LotterySource {
  id: string;
  name: string;
  url: string;
  mainCount: number;
  bonusField?: string; // separate field for bonus number (e.g., 'mega_ball')
}

const sources: LotterySource[] = [
  {
    id: 'powerball',
    name: 'Powerball',
    url: 'https://data.ny.gov/resource/d6yy-54nr.json',
    mainCount: 5,
  },
  {
    id: 'mega-millions',
    name: 'Mega Millions',
    url: 'https://data.ny.gov/resource/5xaw-6ayf.json',
    mainCount: 5,
    bonusField: 'mega_ball',
  },
];

interface SodaRecord {
  draw_date: string;
  winning_numbers: string;
  multiplier?: string;
  mega_ball?: string;
}

interface DrawResult {
  date: string;
  numbers: number[];
  bonusNumber: number;
  multiplier?: number;
}

interface LotteryData {
  lottery: string;
  lastUpdated: string;
  draws: DrawResult[];
}

async function fetchData(source: LotterySource): Promise<DrawResult[]> {
  const url = `${source.url}?$limit=50000&$order=draw_date DESC`;
  console.log(`Fetching ${source.name} data from SODA API...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.name}: ${response.status} ${response.statusText}`);
  }

  const rawData: SodaRecord[] = await response.json();
  console.log(`  Received ${rawData.length} records`);

  const draws: DrawResult[] = [];

  for (const record of rawData) {
    try {
      if (!record.draw_date || !record.winning_numbers) continue;

      const date = record.draw_date.split('T')[0];
      const allNumbers = record.winning_numbers.trim().split(/\s+/).map(Number);

      if (allNumbers.some(isNaN)) continue;

      let mainNumbers: number[];
      let bonusNumber: number;

      if (source.bonusField && (record as unknown as Record<string, string>)[source.bonusField]) {
        // Bonus number is in a separate field (e.g., Mega Millions)
        if (allNumbers.length < source.mainCount) continue;
        mainNumbers = allNumbers.slice(0, source.mainCount);
        bonusNumber = parseInt((record as unknown as Record<string, string>)[source.bonusField]);
        if (isNaN(bonusNumber)) continue;
      } else {
        // Bonus number is the last number in winning_numbers (e.g., Powerball)
        if (allNumbers.length < source.mainCount + 1) continue;
        mainNumbers = allNumbers.slice(0, source.mainCount);
        bonusNumber = allNumbers[source.mainCount];
      }

      const draw: DrawResult = {
        date,
        numbers: mainNumbers,
        bonusNumber,
      };

      if (record.multiplier) {
        const mult = parseInt(record.multiplier);
        if (!isNaN(mult)) draw.multiplier = mult;
      }

      draws.push(draw);
    } catch {
      // Skip invalid records
    }
  }

  // Sort by date descending
  draws.sort((a, b) => b.date.localeCompare(a.date));
  return draws;
}

async function main() {
  const dataDir = path.join(process.cwd(), 'src', 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let hasChanges = false;

  for (const source of sources) {
    try {
      const draws = await fetchData(source);

      if (draws.length === 0) {
        console.log(`  Warning: No valid draws found for ${source.name}`);
        continue;
      }

      const data: LotteryData = {
        lottery: source.id,
        lastUpdated: new Date().toISOString(),
        draws,
      };

      const filePath = path.join(dataDir, `${source.id}.json`);

      // Check if data has changed
      let existingData = '';
      try {
        existingData = fs.readFileSync(filePath, 'utf-8');
      } catch {
        // File doesn't exist yet
      }

      const newData = JSON.stringify(data, null, 2);

      if (existingData !== newData) {
        fs.writeFileSync(filePath, newData);
        console.log(`  Saved ${draws.length} draws to ${source.id}.json`);
        hasChanges = true;
      } else {
        console.log(`  No changes for ${source.name}`);
      }
    } catch (error) {
      console.error(`  Error fetching ${source.name}:`, error);
    }
  }

  if (hasChanges) {
    console.log('\nData updated successfully!');
  } else {
    console.log('\nNo data changes detected.');
  }
}

main().catch(console.error);
