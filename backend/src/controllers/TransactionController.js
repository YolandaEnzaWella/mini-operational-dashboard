const Transaction = require('../models/Transaction');
const TransactionService = require('../services/TransactionService');
const { broadcast } = require('../helpers/realtime');

class TransactionController {
  static async index(req, res) {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const transactions = await Transaction.latest({
      itemId: req.query.item_id,
      type: req.query.type,
      limit,
    });

    res.json({ data: transactions });
  }

  static async store(req, res) {
    const transaction = await TransactionService.create(req.body);

    broadcast('data-changed');
    res.status(201).json({ message: 'Transaksi berhasil disimpan', data: transaction });
  }
}

module.exports = TransactionController;
