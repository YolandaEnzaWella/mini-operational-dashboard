const db = require('../config/database');

class Warehouse {
  static async all() {
    const [rows] = await db.query('SELECT id, name, city FROM warehouses ORDER BY name');
    return rows;
  }

  static async find(id) {
    const [rows] = await db.query('SELECT id, name, city FROM warehouses WHERE id = ?', [id]);
    return rows[0] || null;
  }
}

module.exports = Warehouse;
