const db = require('../config/database');
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const HttpError = require('../helpers/HttpError');
const { determineStatus } = require('../helpers/stockHelper');

class TransactionService {
  static async create(data) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const item = await Item.findForUpdate(connection, data.item_id);

      if (!item) {
        throw new HttpError(404, 'Barang tidak ditemukan');
      }

      if (data.type === 'out' && item.status === 'Maintenance') {
        throw new HttpError(422, `${item.name} sedang maintenance dan tidak bisa dikeluarkan`);
      }

      if (data.type === 'out' && data.quantity > item.stock) {
        throw new HttpError(422, `Stok tidak mencukupi. Stok ${item.name} tersisa ${item.stock} ${item.unit}`);
      }

      const stockBefore = item.stock;
      const stockAfter = data.type === 'in' ? stockBefore + data.quantity : stockBefore - data.quantity;
      const status = determineStatus(stockAfter, item.min_stock, item.status === 'Maintenance');

      await Item.updateStock(connection, item.id, stockAfter, status);

      const transactionId = await Transaction.create(connection, {
        item_id: item.id,
        type: data.type,
        quantity: data.quantity,
        stock_before: stockBefore,
        stock_after: stockAfter,
        note: data.note || null,
        created_by: data.created_by,
      });

      await connection.commit();

      return {
        id: transactionId,
        item_id: item.id,
        item_name: item.name,
        type: data.type,
        quantity: data.quantity,
        stock_before: stockBefore,
        stock_after: stockAfter,
        status,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = TransactionService;
