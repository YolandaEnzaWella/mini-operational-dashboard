const db = require('../config/database');

class Transaction {
  static async latest(filters) {
    const conditions = [];
    const params = [];

    if (filters.itemId) {
      conditions.push('transactions.item_id = ?');
      params.push(filters.itemId);
    }

    if (filters.type) {
      conditions.push('transactions.type = ?');
      params.push(filters.type);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT
         transactions.*,
         items.code AS item_code,
         items.name AS item_name,
         items.unit AS item_unit,
         warehouses.name AS warehouse_name
       FROM transactions
       JOIN items ON items.id = transactions.item_id
       JOIN warehouses ON warehouses.id = items.warehouse_id
       ${where}
       ORDER BY transactions.created_at DESC, transactions.id DESC
       LIMIT ?`,
      [...params, filters.limit]
    );

    return rows;
  }

  static async create(connection, data) {
    const [result] = await connection.query(
      `INSERT INTO transactions (item_id, type, quantity, stock_before, stock_after, note, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.item_id, data.type, data.quantity, data.stock_before, data.stock_after, data.note, data.created_by]
    );

    return result.insertId;
  }

  static async todaySummary() {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total_transactions,
        COALESCE(SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END), 0) AS total_in,
        COALESCE(SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END), 0) AS total_out
      FROM transactions
      WHERE DATE(created_at) = CURDATE()
    `);

    return rows[0];
  }

  static async dailyTotals(days) {
    const [rows] = await db.query(
      `SELECT
         DATE(created_at) AS date,
         SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) AS total_in,
         SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) AS total_out
       FROM transactions
       WHERE created_at >= CURDATE() - INTERVAL ? DAY
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [days - 1]
    );

    return rows;
  }
}

module.exports = Transaction;
