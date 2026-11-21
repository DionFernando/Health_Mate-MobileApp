import { DEFAULT_SETTINGS } from '../models/SettingsModel';

export const ActionTypes = {
  INIT_SUCCESS: 'INIT_SUCCESS',
  INIT_FAILURE: 'INIT_FAILURE',
  LOAD_START: 'LOAD_START',
  RECORDS_LOADED: 'RECORDS_LOADED',
  WEEK_LOADED: 'WEEK_LOADED',
  SET_FILTER: 'SET_FILTER',
  CLEAR_FILTER: 'CLEAR_FILTER',
  TOGGLE_SORT: 'TOGGLE_SORT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
};

export const initialState = {
  status: 'initializing', 
  isLoading: false,
  error: null,
  records: [], 
  week: [], 
  filter: null, 
  sortNewestFirst: true,
  settings: DEFAULT_SETTINGS,
};

export function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.INIT_SUCCESS:
      return { ...state, status: 'ready', settings: action.settings };
    case ActionTypes.INIT_FAILURE:
      return { ...state, status: 'failed', error: action.error };
    case ActionTypes.LOAD_START:
      return { ...state, isLoading: true };
    case ActionTypes.RECORDS_LOADED:
      return { ...state, isLoading: false, records: action.records, error: null };
    case ActionTypes.WEEK_LOADED:
      return { ...state, week: action.week };
    case ActionTypes.SET_FILTER: {
      const { from, to } = action;
      return { ...state, filter: from <= to ? { from, to } : { from: to, to: from } };
    }
    case ActionTypes.CLEAR_FILTER:
      return { ...state, filter: null };
    case ActionTypes.TOGGLE_SORT:
      return { ...state, sortNewestFirst: !state.sortNewestFirst };
    case ActionTypes.SET_ERROR:
      return { ...state, isLoading: false, error: action.error };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionTypes.SETTINGS_UPDATED:
      return { ...state, settings: action.settings };
    default:
      return state;
  }
}
