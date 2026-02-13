/**
 * Parses lottery draw time strings and calculates next draw dates.
 * All calculations use America/New_York timezone.
 */

const ET_TIMEZONE = 'America/New_York';

interface ParsedTime {
  hour: number;
  minute: number;
}

/** Day name to JS day index (0=Sunday) */
const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Parse draw time string into hour/minute pairs.
 * Handles "10:59 PM ET" and "2:30 PM & 10:30 PM ET" formats.
 */
export function parseDrawTime(drawTime: string): ParsedTime[] {
  const cleaned = drawTime.replace(/\s*ET\s*$/, '');
  const parts = cleaned.split('&').map(s => s.trim());

  return parts.map(part => {
    const match = part.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { hour: 0, minute: 0 };

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return { hour, minute };
  });
}

/** Get the current time in ET as components */
function getNowInET(): { year: number; month: number; day: number; hour: number; minute: number; second: number; dayOfWeek: number } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ET_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '0';

  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10),
    day: parseInt(get('day'), 10),
    hour: parseInt(get('hour'), 10),
    minute: parseInt(get('minute'), 10),
    second: parseInt(get('second'), 10),
    dayOfWeek: weekdayMap[get('weekday')] ?? 0,
  };
}

/** Build a Date for a given ET date/time */
function buildETDate(year: number, month: number, day: number, hour: number, minute: number): Date {
  // Create date string in ET, then parse
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

  // Use a temporary date to find the UTC offset for this ET datetime
  const tempDate = new Date(dateStr + 'Z');
  const etStr = tempDate.toLocaleString('en-US', { timeZone: ET_TIMEZONE });
  const etDate = new Date(etStr);
  const offsetMs = tempDate.getTime() - etDate.getTime();

  return new Date(tempDate.getTime() + offsetMs);
}

export interface NextDrawInfo {
  date: Date;
  isTonight: boolean;
  isRetired: boolean;
}

/**
 * Calculate the next draw date for a lottery game.
 * Returns null only if configuration is invalid.
 */
export function getNextDrawDate(config: {
  drawDays: string[];
  drawTime: string;
  retiredDate?: string;
}): NextDrawInfo | null {
  const { drawDays, drawTime, retiredDate } = config;

  // Check if game is retired
  if (retiredDate) {
    const retired = new Date(retiredDate + 'T23:59:59-05:00');
    if (new Date() > retired) {
      return { date: retired, isTonight: false, isRetired: true };
    }
  }

  const times = parseDrawTime(drawTime);
  if (times.length === 0 || drawDays.length === 0) return null;

  const drawDayIndices = drawDays.map(d => DAY_MAP[d]).filter(d => d !== undefined);
  if (drawDayIndices.length === 0) return null;

  const now = getNowInET();
  let closest: Date | null = null;

  // Check today and next 7 days
  for (let offset = 0; offset <= 7; offset++) {
    // Calculate the target date by adding offset days
    const targetDate = new Date(now.year, now.month - 1, now.day + offset);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    const targetDay = targetDate.getDate();
    const targetDayOfWeek = targetDate.getDay();

    if (!drawDayIndices.includes(targetDayOfWeek)) continue;

    for (const time of times) {
      const drawDate = buildETDate(targetYear, targetMonth, targetDay, time.hour, time.minute);

      // Skip draws that have already passed
      if (drawDate.getTime() <= Date.now()) continue;

      if (!closest || drawDate.getTime() < closest.getTime()) {
        closest = drawDate;
      }
    }

    // If we found a draw on this day, no need to check further days
    if (closest && offset > 0) break;
  }

  if (!closest) return null;

  const msUntil = closest.getTime() - Date.now();
  const hoursUntil = msUntil / (1000 * 60 * 60);

  return {
    date: closest,
    isTonight: hoursUntil <= 3 && hoursUntil > 0,
    isRetired: false,
  };
}
