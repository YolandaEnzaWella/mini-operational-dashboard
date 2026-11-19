const Item = require('../models/Item');
const ItemService = require('../services/ItemService');
const HttpError = require('../helpers/HttpError');
const { broadcast } = require('../helpers/realtime');

class ItemController {
  static async index(req, res) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const perPage = Math.min(Math.max(Number(req.query.per_page) || 10, 1), 100);

    const result = await Item.paginate({
      search: req.query.search,
      status: req.query.status,
      warehouseId: req.query.warehouse_id,
      categoryId: req.query.category_id,
      sortBy: req.query.sort_by,
      sortOrder: req.query.sort_order,
      page,
      perPage,
    });

    res.json({
      data: result.data,
      meta: {
        current_page: page,
        per_page: perPage,
        total: result.total,
        last_page: Math.max(Math.ceil(result.total / perPage), 1),
      },
    });
  }

  static async show(req, res) {
    const item = await Item.find(req.params.id);

    if (!item) {
      throw new HttpError(404, 'Barang tidak ditemukan');
    }

    res.json({ data: item });
  }

  static async store(req, res) {
    const item = await ItemService.create(req.body);

    broadcast('data-changed');
    res.status(201).json({ message: 'Barang berhasil ditambahkan', data: item });
  }

  static async update(req, res) {
    const item = await Item.find(req.params.id);

    if (!item) {
      throw new HttpError(404, 'Barang tidak ditemukan');
    }

    const updatedItem = await ItemService.update(item, req.body);

    broadcast('data-changed');
    res.json({ message: 'Barang berhasil diperbarui', data: updatedItem });
  }

  static async destroy(req, res) {
    const item = await Item.find(req.params.id);

    if (!item) {
      throw new HttpError(404, 'Barang tidak ditemukan');
    }

    await Item.delete(item.id);

    broadcast('data-changed');
    res.json({ message: 'Barang berhasil dihapus' });
  }
}

module.exports = ItemController;
