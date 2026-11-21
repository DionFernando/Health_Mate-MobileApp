import { TABLE_HEALTH_RECORDS as TABLE } from '../config/constants';
import { seedDummyData } from '../database/database';
import { fromRow, toParams } from './HealthRecord';

export default class HealthRecordModel {
  /** @param {import('expo-sqlite').SQLiteDatabase} db */
  constructor(db) {
    this.db = db;
  }

  async getAll() {
    const rows = await this.db.getAllAsync(
      `SELECT * FROM ${TABLE} ORDER BY date DESC, id DESC`,
    );
    return rows.map(fromRow);
  }

  async getByDateRange(from, to) {
    const rows = await this.db.getAllAsync(
      `SELECT * FROM ${TABLE} WHERE date BETWEEN ? AND ? ORDER BY date DESC, id DESC`,
      [from, to],
    );
    return rows.map(fromRow);
  }

  async getById(id) {
    const row = await this.db.getFirstAsync(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
    return row ? fromRow(row) : null;
  }

  async getDailySummaries(from, to) {
    const rows = await this.db.getAllAsync(
      `SELECT date,
              SUM(steps)    AS steps,
              SUM(calories) AS calories,
              SUM(water)    AS water,
              COUNT(*)      AS entryCount
         FROM ${TABLE}
        WHERE date BETWEEN ? AND ?
        GROUP BY date
        ORDER BY date ASC`,
      [from, to],
    );
    return rows.map((r) => ({
      date: r.date,
      steps: Number(r.steps) || 0,
      calories: Number(r.calories) || 0,
      water: Number(r.water) || 0,
      entryCount: Number(r.entryCount) || 0,
    }));
  }

  async insert(record) {
    const result = await this.db.runAsync(
      `INSERT INTO ${TABLE} (date, steps, calories, water) VALUES (?, ?, ?, ?)`,
      toParams(record),
    );
    return result.lastInsertRowId;
  }

  async update(record) {
    if (record.id === null || record.id === undefined) {
      throw new Error('Cannot update a record without an id');
    }
    const result = await this.db.runAsync(
      `UPDATE ${TABLE} SET date = ?, steps = ?, calories = ?, water = ? WHERE id = ?`,
      [...toParams(record), record.id],
    );
    return result.changes;
  }

  async remove(id) {
    const result = await this.db.runAsync(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
    return result.changes;
  }

  async resetToSampleData() {
    await this.db.runAsync(`DELETE FROM ${TABLE}`);
    await seedDummyData(this.db);
  }
}
