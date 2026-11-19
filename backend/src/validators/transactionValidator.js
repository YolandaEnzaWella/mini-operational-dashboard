const { body } = require('express-validator');

const storeTransactionRules = [
  body('item_id')
    .isInt().withMessage('Barang wajib dipilih')
    .toInt(),
  body('type')
    .isIn(['in', 'out']).withMessage('Jenis transaksi harus masuk atau keluar'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('Jumlah minimal 1')
    .toInt(),
  body('created_by')
    .trim()
    .notEmpty().withMessage('Nama petugas wajib diisi')
    .isLength({ max: 100 }).withMessage('Nama petugas maksimal 100 karakter'),
  body('note')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 255 }).withMessage('Catatan maksimal 255 karakter'),
];

module.exports = { storeTransactionRules };
