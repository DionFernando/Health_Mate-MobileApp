import { useMemo } from 'react';

import { METRIC_KEYS } from '../config/constants';
import { addDays, todayDb } from '../utils/dateUtils';
import { useAppContext } from '../store/AppContext';

export const emptyDay = (date) => ({ date, steps: 0, calories: 0, water: 0, entryCount: 0 });

export function buildWeek(summaries, today = todayDb(), days = 7) {
  const byDate = Object.fromEntries(summaries.map((s) => [s.date, s]));
  const week = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i);
    week.push(byDate[date] || emptyDay(date));
  }
  return week;
}

export function computeAverages(week) {
  const logged = week.filter((d) => d.entryCount > 0);
  const result = {};
  for (const key of METRIC_KEYS) {
    result[key] = logged.length
      ? Math.round(logged.reduce((sum, d) => sum + d[key], 0) / logged.length)
      : 0;
  }
  return result;
}

export function computeStreak(week) {
  const days = [...week].reverse();
  let i = days.length && days[0].entryCount === 0 ? 1 : 0;
  let streak = 0;
  for (; i < days.length && days[i].entryCount > 0; i += 1) streak += 1;
  return streak;
}

export function goalProgress(value, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(value / goal, 1);
}

export function useDashboardController() {
  const { state } = useAppContext();
  const { week, settings } = state;

  return useMemo(() => {
    const today = todayDb();
    const todaySummary = week.find((d) => d.date === today) || emptyDay(today);
    return {
      today: todaySummary,
      week: week.length ? week : buildWeek([], today),
      goals: settings.goals,
      averages: computeAverages(week),
      streak: computeStreak(week),
      progress: Object.fromEntries(
        METRIC_KEYS.map((k) => [k, goalProgress(todaySummary[k], settings.goals[k])]),
      ),
    };
  }, [week, settings.goals]);
}
