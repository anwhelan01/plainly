import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** A shared, persistent ceiling. All processes must use the same local volume. */
export function reserveRewrite(directory: string, dailyLimit = 50, now = Date.now()): boolean {
  if (!directory || !Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) return false;
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const lock = join(directory, 'quota.lock');
  try { mkdirSync(lock, { mode: 0o700 }); } catch { return false; }
  try {
    const path = join(directory, 'quota.json');
    let state: { day: string; count: number; minute: number; burst: number };
    try { state = JSON.parse(readFileSync(path, 'utf8')); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') return false;
      state = { day: '', count: 0, minute: 0, burst: 0 };
    }
    if (typeof state.day !== 'string' || !Number.isInteger(state.count) || state.count < 0 || !Number.isInteger(state.minute) || !Number.isInteger(state.burst) || state.burst < 0) return false;
    const day = new Date(now).toISOString().slice(0, 10);
    const minute = Math.floor(now / 60_000);
    // Clock rollback must not restore spent quota.
    if (state.day > day || state.minute > minute) return false;
    if (state.day !== day) state = { day, count: 0, minute, burst: 0 };
    if (state.minute !== minute) { state.minute = minute; state.burst = 0; }
    if (state.count >= dailyLimit || state.burst >= 3) return false;
    state.count++; state.burst++;
    const temporary = join(directory, 'quota.next');
    writeFileSync(temporary, JSON.stringify(state), { mode: 0o600 });
    renameSync(temporary, path);
    return true;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}
