const { body } = require('express-validator');
const Item = require('../models/Item');
const Category = require('../models/Category');
const Warehouse = require('../models/Warehouse');

const itemRules = [
  body('code')
    .trim()
    .notEmpty().withMessage('Kode barang wajib diisi')
    .isLength({ max: 50 }).withMessage('Kode barang maksimal 50 karakter')
    .custom(async (code, { req }) => {
      const existing = await Item.findByCode(code);

      if (existing && String(existing.id) !== String(req.params.id)) {
        throw new Error('Kode barang sudah digunakan');
      }
    }),
  body('name')
    .trim()
    .notEmpty().withMessage('Nama barang wajib diisi')
    .isLength({ max: 150 }).withMessage('Nama barang maksimal 150 karakter'),
  body('category_id')
    .isInt().withMessage('Kategori wajib dipilih')
    .custom(async (id) => {
      if (!(await Category.find(id))) {
        throw new Error('Kategori tidak ditemukan');
      }
    }),
  body('warehouse_id')
    .isInt().withMessage('Gudang wajib dipilih')
    .custom(async (id) => {
      if (!(await Warehouse.find(id))) {
        throw new Error('Gudang tidak ditemukan');
      }
    }),
  body('min_stock')
    .isInt({ min: 0 }).withMessage('Stok minimum harus angka 0 atau lebih')
    .toInt(),
  body('unit')
    .trim()
    .notEmpty().withMessage('Satuan wajib diisi')
    .isLength({ max: 20 }).withMessage('Satuan maksimal 20 karakter'),
  body('is_maintenance')
    .optional()
    .isBoolean().withMessage('Status maintenance tidak valid')
    .toBoolean(),
];

const storeItemRules = [
  ...itemRules,
  body('stock')
    .isInt({ min: 0 }).withMessage('Stok awal harus angka 0 atau lebih')
    .toInt(),
];

const updateItemRules = itemRules;

module.exports = { storeItemRules, updateItemRules };
