const Category = require('../models/Category');
const Warehouse = require('../models/Warehouse');

class MasterDataController {
  static async categories(req, res) {
    res.json({ data: await Category.all() });
  }

  static async warehouses(req, res) {
    res.json({ data: await Warehouse.all() });
  }
}

module.exports = MasterDataController;
