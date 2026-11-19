const Item = require('../models/Item');
const Transaction = require('../models/Transaction');

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

class DashboardController {
  static async summary(req, res) {
    const items = await Item.summary();
    const today = await Transaction.todaySummary();

    res.json({
      data: {
        total_items: Number(items.total_items),
        total_stock: Number(items.total_stock),
        available: Number(items.available),
        low_stock: Number(items.low_stock),
        maintenance: Number(items.maintenance),
        transactions_today: Number(today.total_transactions),
        stock_in_today: Number(today.total_in),
        stock_out_today: Number(today.total_out),
      },
    });
  }

  static async chart(req, res) {
    const days = [7, 14, 30].includes(Number(req.query.days)) ? Number(req.query.days) : 7;
    const rows = await Transaction.dailyTotals(days);

    const chart = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateString = toDateString(date);
      const row = rows.find((item) => item.date === dateString);

      chart.push({
        date: dateString,
        total_in: row ? Number(row.total_in) : 0,
        total_out: row ? Number(row.total_out) : 0,
      });
    }

    res.json({ data: chart });
  }
}

module.exports = DashboardController;
