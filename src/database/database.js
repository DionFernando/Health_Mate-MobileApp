import * as SQLite from 'expo-sqlite';

import { DB_NAME, TABLE_HEALTH_RECORDS } from '../config/constants';
import { addDays, todayDb } from '../utils/dateUtils';

const SCHEMA_VERSION = 1;
let dbPromise = null;

export function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await initDatabase(db);
      return db;
    });
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

export async function initDatabase(db) {
  const row = await db.getFirstAsync('PRAGMA user_version');
  const currentVersion = row ? row.user_version : 0;
  if (currentVersion >= SCHEMA_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS ${TABLE_HEALTH_RECORDS} (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        date     TEXT    NOT NULL,
        steps    INTEGER NOT NULL DEFAULT 0 CHECK (steps >= 0),
        calories INTEGER NOT NULL DEFAULT 0 CHECK (calories >= 0),
        water    INTEGER NOT NULL DEFAULT 0 CHECK (water >= 0)
      );
      CREATE INDEX IF NOT EXISTS idx_health_records_date
        ON ${TABLE_HEALTH_RECORDS}(date);
    `);
    await seedDummyData(db);
  }
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

export function buildDummyRecords(today = todayDb(), days = 14) {
  let seed = 42;
  const rand = (max) => {
    seed = (seed * 16807) % 2147483647;
    return seed % max;
  };
  const records = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    records.push({
      date: addDays(today, -i),
      steps: 4000 + rand(8000),
      calories: 200 + rand(450),
      water: 1250 + rand(8) * 250,
    });
  }
  return records;
}

export async function seedDummyData(db) {
  const records = buildDummyRecords();
  await db.withTransactionAsync(async () => {
    for (const r of records) {
      await db.runAsync(
        `INSERT INTO ${TABLE_HEALTH_RECORDS} (date, steps, calories, water) VALUES (?, ?, ?, ?)`,
        [r.date, r.steps, r.calories, r.water],
      );
    }
  });
}
