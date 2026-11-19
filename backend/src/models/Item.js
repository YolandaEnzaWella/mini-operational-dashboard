const db = require('../config/database');

const SELECT_ITEM = `
  SELECT
    items.*,
    categories.name AS category_name,
    warehouses.name AS warehouse_name
  FROM items
  JOIN categories ON categories.id = items.category_id
  JOIN warehouses ON warehouses.id = items.warehouse_id
`;

const SORTABLE_COLUMNS = {
  name: 'items.name',
  stock: 'items.stock',
  status: 'items.status',
  category: 'categories.name',
  warehouse: 'warehouses.name',
  updated_at: 'items.updated_at',
};

class Item {
  static async paginate(filters) {
    const conditions = [];
    const params = [];

    if (filters.search) {
      conditions.push('(items.name LIKE ? OR items.code LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.status) {
      conditions.push('items.status = ?');
      params.push(filters.status);
    }

    if (filters.warehouseId) {
      conditions.push('items.warehouse_id = ?');
      params.push(filters.warehouseId);
    }

    if (filters.categoryId) {
      conditions.push('items.category_id = ?');
      params.push(filters.categoryId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortColumn = SORTABLE_COLUMNS[filters.sortBy] || SORTABLE_COLUMNS.name;
    const sortOrder = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
    const offset = (filters.page - 1) * filters.perPage;

    const [rows] = await db.query(
      `${SELECT_ITEM} ${where} ORDER BY ${sortColumn} ${sortOrder}, items.id ASC LIMIT ? OFFSET ?`,
      [...params, filters.perPage, offset]
    );

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM items
       JOIN categories ON categories.id = items.category_id
       JOIN warehouses ON warehouses.id = items.warehouse_id
       ${where}`,
      params
    );

    return { data: rows, total: countRows[0].total };
  }

  static async find(id) {
    const [rows] = await db.query(`${SELECT_ITEM} WHERE items.id = ?`, [id]);
    return rows[0] || null;
  }

  static async findByCode(code) {
    const [rows] = await db.query('SELECT id, code FROM items WHERE code = ?', [code]);
    return rows[0] || null;
  }

  static async findForUpdate(connection, id) {
    const [rows] = await connection.query('SELECT * FROM items WHERE id = ? FOR UPDATE', [id]);
    return rows[0] || null;
  }

  static async create(connection, data) {
    const [result] = await connection.query(
      `INSERT INTO items (code, name, category_id, warehouse_id, stock, min_stock, unit, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.code, data.name, data.category_id, data.warehouse_id, data.stock, data.min_stock, data.unit, data.status]
    );

    return result.insertId;
  }

  static async update(id, data) {
    await db.query(
      `UPDATE items
       SET code = ?, name = ?, category_id = ?, warehouse_id = ?, min_stock = ?, unit = ?, status = ?
       WHERE id = ?`,
      [data.code, data.name, data.category_id, data.warehouse_id, data.min_stock, data.unit, data.status, id]
    );
  }

  static async updateStock(connection, id, stock, status) {
    await connection.query('UPDATE items SET stock = ?, status = ? WHERE id = ?', [stock, status, id]);
  }

  static async delete(id) {
    await db.query('DELETE FROM items WHERE id = ?', [id]);
  }

  static async summary() {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) AS total_items,
        COALESCE(SUM(stock), 0) AS total_stock,
        COALESCE(SUM(status = 'Available'), 0) AS available,
        COALESCE(SUM(status = 'Low Stock'), 0) AS low_stock,
        COALESCE(SUM(status = 'Maintenance'), 0) AS maintenance
      FROM items
    `);

    return rows[0];
  }
}

module.exports = Item;
