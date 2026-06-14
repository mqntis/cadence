import type { RewardEvent } from './types.js';
import { MAX } from './scheduler.js';

const LATE_NIGHT_HOUR = 22;

export interface RewardResult {
  delta: number;
  label: string;
  reason: string;
}

// Rewards finishing tasks before their deadline.
export function earlyBird(daysEarly: number): RewardResult {
  const delta = Math.min(daysEarly, 4) * 8;
  return {
    delta,
    label: 'Early Bird',
    reason: `Finished ${daysEarly} day${daysEarly !== 1 ? 's' : ''} early — earned ${delta} coins`,
  };
}

// Converts AI difficulty score into a coin reward.
export function assignmentDifficultyReward(score: number): RewardResult {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return {
    delta: clamped,
    label: 'Difficulty Reward',
    reason: `Task difficulty rated ${clamped}/100 by AI`,
  };
}

// Grants coins from AI-estimated duration in 5-minute blocks.
export function assignmentDurationReward(estimatedMinutes: number): RewardResult {
  const safeMinutes = Math.max(0, Math.round(estimatedMinutes));
  const fiveMinuteBlocks = Math.ceil(safeMinutes / 5);
  const delta = fiveMinuteBlocks * 10;

  return {
    delta,
    label: 'Duration Reward',
    reason: `${safeMinutes} estimated minute${safeMinutes !== 1 ? 's' : ''} → ${fiveMinuteBlocks} x 5m blocks earned ${delta} coins`,
  };
}

// Rewards staying within paced daily load.
export function pacedDay(): RewardResult {
  return { delta: 6, label: 'Paced Day', reason: 'Stayed within your paced daily load' };
}

// Rewards protecting nightly rest boundaries.
export function restProtected(): RewardResult {
  return { delta: 15, label: 'Rest Protected', reason: 'Protected your rest time today' };
}

// Rewards maintaining consistent weekly pacing.
export function smoothWeek(): RewardResult {
  return { delta: 25, label: 'Smooth Week', reason: 'Maintained a balanced workload all week' };
}

// Rewards logging work honestly.
export function honestLog(): RewardResult {
  return { delta: 4, label: 'Honest Log', reason: 'Logged your actual effort honestly' };
}

// Zero-reward event for cram behavior.
export function cram(): RewardResult {
  return {
    delta: 0,
    label: 'Cram (no coins)',
    reason: 'Cramming earns zero coins by design — sustainable pacing is the goal',
  };
}

// Zero-reward event for exceeding the daily cap.
export function overCap(hoursToday: number): RewardResult {
  return {
    delta: 0,
    label: 'Over Cap (no coins)',
    reason: `Today's load (${hoursToday}h) exceeded the ${MAX}h daily cap — grinding earns zero coins`,
  };
}

// Zero-reward event for late-night work sessions.
export function lateNight(): RewardResult {
  return {
    delta: 0,
    label: 'Late Night (no coins)',
    reason: `Work logged after ${LATE_NIGHT_HOUR}:00 earns zero coins — protect your rest`,
  };
}

// Spends coins to unlock a recharge day.
export function rechargeSpend(balance: number): { ok: boolean; newBalance: number; message: string } {
  const COST = 40;
  if (balance < COST) {
    return { ok: false, newBalance: balance, message: `Need ${COST} coins for a Recharge day (you have ${balance})` };
  }
  return { ok: true, newBalance: balance - COST, message: 'Recharge day unlocked — rest guilt-free' };
}

// Checks if a task was completed too close to deadline.
export function checkCram(hoursUntilDue: number): boolean {
  return hoursUntilDue < 12;
}

// Checks if today's total load exceeded max threshold.
export function checkOverCap(hoursToday: number): boolean {
  return hoursToday > MAX;
}

// Checks if a submission happened during protected late hours.
export function checkLateNight(submittedAt: Date): boolean {
  return submittedAt.getHours() >= LATE_NIGHT_HOUR;
}

// Converts a reward result into a persisted event payload.
export function makeRewardEvent(result: RewardResult, type: string): RewardEvent {
  return { type, delta: result.delta, label: result.label, reason: result.reason, timestamp: Date.now() };
}
