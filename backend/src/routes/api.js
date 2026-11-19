const express = require('express');
const ItemController = require('../controllers/ItemController');
const TransactionController = require('../controllers/TransactionController');
const DashboardController = require('../controllers/DashboardController');
const MasterDataController = require('../controllers/MasterDataController');
const validate = require('../middleware/validate');
const realtime = require('../helpers/realtime');
const { storeItemRules, updateItemRules } = require('../validators/itemValidator');
const { storeTransactionRules } = require('../validators/transactionValidator');

const router = express.Router();

router.get('/events', realtime.subscribe);

router.get('/dashboard/summary', DashboardController.summary);
router.get('/dashboard/chart', DashboardController.chart);

router.get('/categories', MasterDataController.categories);
router.get('/warehouses', MasterDataController.warehouses);

router.get('/items', ItemController.index);
router.get('/items/:id', ItemController.show);
router.post('/items', storeItemRules, validate, ItemController.store);
router.put('/items/:id', updateItemRules, validate, ItemController.update);
router.delete('/items/:id', ItemController.destroy);

router.get('/transactions', TransactionController.index);
router.post('/transactions', storeTransactionRules, validate, TransactionController.store);

module.exports = router;
