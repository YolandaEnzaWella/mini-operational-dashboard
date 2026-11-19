const db = require('../config/database');

class Category {
  static async all() {
    const [rows] = await db.query('SELECT id, name FROM categories ORDER BY name');
    return rows;
  }

  static async find(id) {
    const [rows] = await db.query('SELECT id, name FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  }
}

module.exports = Category;
