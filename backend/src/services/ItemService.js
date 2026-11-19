const db = require('../config/database');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const { determineStatus } = require('../helpers/stockHelper');

class ItemService {
  static async create(data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const status = determineStatus(data.stock, data.min_stock, data.is_maintenance);
      const itemId = await Item.create(connection, { ...data, status });

      if (data.stock > 0) {
        await Transaction.create(connection, {
          item_id: itemId,
          type: 'in',
          quantity: data.stock,
          stock_before: 0,
          stock_after: data.stock,
          note: 'Stok awal',
          created_by: data.created_by || 'Admin',
        });
      }

      await connection.commit();

      return Item.find(itemId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(item, data) {
    const status = determineStatus(item.stock, data.min_stock, data.is_maintenance);

    await Item.update(item.id, { ...data, status });

    return Item.find(item.id);
  }
}

module.exports = ItemService;
