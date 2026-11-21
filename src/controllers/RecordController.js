import { useMemo } from 'react';

import { createHealthRecord, validateRecordInput } from '../models/HealthRecord';
import { ActionTypes } from '../store/appReducer';
import { useAppContext } from '../store/AppContext';
import { addDays, todayDb } from '../utils/dateUtils';
import { buildWeek } from './DashboardController';

export function createRecordController({ model, dispatch, filter: currentFilter = null }) {
  async function refresh(filter = currentFilter) {
    dispatch({ type: ActionTypes.LOAD_START });
    try {
      const records = filter
        ? await model.getByDateRange(filter.from, filter.to)
        : await model.getAll();
      dispatch({ type: ActionTypes.RECORDS_LOADED, records });

      const today = todayDb();
      const summaries = await model.getDailySummaries(addDays(today, -6), today);
      dispatch({ type: ActionTypes.WEEK_LOADED, week: buildWeek(summaries, today) });
      return true;
    } catch (e) {
      console.warn('refresh failed', e);
      dispatch({ type: ActionTypes.SET_ERROR, error: 'Could not load records. Please try again.' });
      return false;
    }
  }

  async function mutate(action, errorMessage) {
    try {
      const result = await action();
      await refresh();
      return { ok: true, result };
    } catch (e) {
      console.warn(errorMessage, e);
      dispatch({ type: ActionTypes.SET_ERROR, error: errorMessage });
      return { ok: false, error: errorMessage };
    }
  }

  return {
    refresh,

    async saveRecord(input, id = null) {
      const { isValid, errors } = validateRecordInput(input);
      if (!isValid) return { ok: false, errors };
      const record = createHealthRecord({ ...input, id });
      const outcome = id === null
        ? await mutate(() => model.insert(record), 'Could not save the record.')
        : await mutate(() => model.update(record), 'Could not update the record.');
      return outcome.ok ? { ok: true, errors: {} } : { ok: false, errors: { form: outcome.error } };
    },

    async deleteRecord(record) {
      const outcome = await mutate(() => model.remove(record.id), 'Could not delete the record.');
      return outcome.ok ? record : null;
    },

    async restoreRecord(record) {
      const outcome = await mutate(
        () => model.insert(createHealthRecord({ ...record, id: null })),
        'Could not restore the record.',
      );
      return outcome.ok;
    },

    async quickAddWater(ml) {
      const record = createHealthRecord({ date: todayDb(), water: ml });
      const outcome = await mutate(() => model.insert(record), 'Could not add water.');
      return outcome.ok;
    },
    
    async searchByDate(date) {
      dispatch({ type: ActionTypes.SET_FILTER, from: date, to: date });
      return refresh({ from: date, to: date });
    },

    async filterByRange(from, to) {
      const filter = from <= to ? { from, to } : { from: to, to: from };
      dispatch({ type: ActionTypes.SET_FILTER, ...filter });
      return refresh(filter);
    },

    async clearFilter() {
      dispatch({ type: ActionTypes.CLEAR_FILTER });
      return refresh(null);
    },

    toggleSort() {
      dispatch({ type: ActionTypes.TOGGLE_SORT });
    },

    clearError() {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },

    async getRecord(id) {
      try {
        return await model.getById(id);
      } catch {
        return null;
      }
    },

    async resetToSampleData() {
      const outcome = await mutate(() => model.resetToSampleData(), 'Could not reset the data.');
      return outcome.ok;
    },
  };
}

/** Records in display order + totals for the current list. */
export function selectVisibleRecords(state) {
  const list = state.sortNewestFirst ? state.records : [...state.records].reverse();
  const totals = state.records.reduce(
    (t, r) => ({ steps: t.steps + r.steps, calories: t.calories + r.calories, water: t.water + r.water }),
    { steps: 0, calories: 0, water: 0 },
  );
  return { list, totals };
}

export function useRecordController() {
  const { state, dispatch, models } = useAppContext();

  const controller = useMemo(
    () => createRecordController({ model: models.records, dispatch, filter: state.filter }),
    [models.records, dispatch, state.filter],
  );

  const { list, totals } = useMemo(() => selectVisibleRecords(state), [state]);

  return {
    ...controller,
    records: list,
    totals,
    filter: state.filter,
    isLoading: state.isLoading,
    error: state.error,
    sortNewestFirst: state.sortNewestFirst,
  };
}
