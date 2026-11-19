require('dotenv').config({ quiet: true });

const db = require('../src/config/database');
const { determineStatus } = require('../src/helpers/stockHelper');

const categories = ['Alat Keselamatan', 'Perkakas', 'Suku Cadang', 'Peralatan IT', 'Kemasan', 'Bahan Habis Pakai'];

const warehouses = [
  { name: 'Gudang Malang', city: 'Malang' },
  { name: 'Gudang Surabaya', city: 'Surabaya' },
  { name: 'Gudang Jakarta', city: 'Jakarta' },
  { name: 'Gudang Semarang', city: 'Semarang' },
];

const items = [
  { code: 'SAF-001', name: 'Helm Safety', category: 1, warehouse: 1, stock: 120, min_stock: 30, unit: 'pcs' },
  { code: 'SAF-002', name: 'Rompi Reflektor', category: 1, warehouse: 2, stock: 45, min_stock: 40, unit: 'pcs' },
  { code: 'SAF-003', name: 'Sarung Tangan Kerja', category: 1, warehouse: 3, stock: 200, min_stock: 50, unit: 'pasang' },
  { code: 'SAF-004', name: 'Full Body Harness', category: 1, warehouse: 4, stock: 15, min_stock: 10, unit: 'pcs' },
  { code: 'TLS-001', name: 'Bor Listrik', category: 2, warehouse: 1, stock: 20, min_stock: 5, unit: 'unit' },
  { code: 'TLS-002', name: 'Gerinda Tangan', category: 2, warehouse: 2, stock: 12, min_stock: 5, unit: 'unit' },
  { code: 'TLS-003', name: 'Mesin Las', category: 2, warehouse: 3, stock: 6, min_stock: 2, unit: 'unit', maintenance: true },
  { code: 'TLS-004', name: 'Kunci Torsi', category: 2, warehouse: 4, stock: 18, min_stock: 5, unit: 'unit' },
  { code: 'SPR-001', name: 'Bearing 6204', category: 3, warehouse: 2, stock: 300, min_stock: 100, unit: 'pcs' },
  { code: 'SPR-002', name: 'Filter Oli Hidrolik', category: 3, warehouse: 1, stock: 40, min_stock: 25, unit: 'pcs' },
  { code: 'SPR-003', name: 'V-Belt B-52', category: 3, warehouse: 4, stock: 60, min_stock: 20, unit: 'pcs' },
  { code: 'IT-001', name: 'Barcode Scanner', category: 4, warehouse: 1, stock: 25, min_stock: 8, unit: 'unit' },
  { code: 'IT-002', name: 'Tablet Lapangan', category: 4, warehouse: 2, stock: 10, min_stock: 4, unit: 'unit', maintenance: true },
  { code: 'IT-003', name: 'Handy Talky', category: 4, warehouse: 3, stock: 14, min_stock: 8, unit: 'unit' },
  { code: 'IT-004', name: 'Printer Label', category: 4, warehouse: 4, stock: 9, min_stock: 3, unit: 'unit' },
  { code: 'PKG-001', name: 'Pallet Plastik', category: 5, warehouse: 1, stock: 250, min_stock: 80, unit: 'pcs' },
  { code: 'PKG-002', name: 'Stretch Film', category: 5, warehouse: 2, stock: 70, min_stock: 50, unit: 'roll' },
  { code: 'PKG-003', name: 'Kardus Besar', category: 5, warehouse: 3, stock: 500, min_stock: 150, unit: 'pcs' },
  { code: 'CNS-001', name: 'Oli Mesin 5L', category: 6, warehouse: 4, stock: 40, min_stock: 15, unit: 'kaleng' },
  { code: 'CNS-002', name: 'Cable Ties', category: 6, warehouse: 1, stock: 30, min_stock: 20, unit: 'pack' },
];

const users = ['Andi', 'Siti', 'Budi', 'Dewi', 'Rizky'];
const notesIn = ['Pengiriman supplier', 'Pengembalian dari lapangan', 'Restock bulanan'];
const notesOut = ['Dipinjam tim lapangan', 'Pemakaian maintenance', 'Kebutuhan proyek'];

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(list) {
  return list[randomNumber(0, list.length - 1)];
}

function randomDateInDay(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomNumber(7, 17), randomNumber(0, 59), randomNumber(0, 59));
  return date > new Date() ? new Date() : date;
}

async function seed() {
  await db.query('DELETE FROM transactions');
  await db.query('DELETE FROM items');
  await db.query('DELETE FROM categories');
  await db.query('DELETE FROM warehouses');
  await db.query('ALTER TABLE categories AUTO_INCREMENT = 1');
  await db.query('ALTER TABLE warehouses AUTO_INCREMENT = 1');
  await db.query('ALTER TABLE items AUTO_INCREMENT = 1');
  await db.query('ALTER TABLE transactions AUTO_INCREMENT = 1');

  for (const name of categories) {
    await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
  }

  for (const warehouse of warehouses) {
    await db.query('INSERT INTO warehouses (name, city) VALUES (?, ?)', [warehouse.name, warehouse.city]);
  }

  const savedItems = [];

  for (const item of items) {
    const createdAt = randomDateInDay(30);
    const [result] = await db.query(
      `INSERT INTO items (code, name, category_id, warehouse_id, stock, min_stock, unit, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.code,
        item.name,
        item.category,
        item.warehouse,
        item.stock,
        item.min_stock,
        item.unit,
        determineStatus(item.stock, item.min_stock, item.maintenance),
        createdAt,
        createdAt,
      ]
    );

    await db.query(
      `INSERT INTO transactions (item_id, type, quantity, stock_before, stock_after, note, created_by, created_at)
       VALUES (?, 'in', ?, 0, ?, 'Stok awal', 'System', ?)`,
      [result.insertId, item.stock, item.stock, createdAt]
    );

    savedItems.push({ ...item, id: result.insertId, maintenance: Boolean(item.maintenance) });
  }

  let totalTransactions = 0;

  for (let daysAgo = 14; daysAgo >= 0; daysAgo--) {
    const transactionsPerDay = randomNumber(4, 10);
    const times = [];

    for (let i = 0; i < transactionsPerDay; i++) {
      times.push(randomDateInDay(daysAgo));
    }

    times.sort((a, b) => a - b);

    for (const time of times) {
      const item = randomFrom(savedItems);
      let type = Math.random() < 0.55 ? 'out' : 'in';
      const quantity = randomNumber(1, Math.max(2, Math.round(item.min_stock / 2)));

      if (type === 'out' && (quantity > item.stock || item.maintenance)) {
        type = 'in';
      }

      const stockBefore = item.stock;
      const stockAfter = type === 'in' ? stockBefore + quantity : stockBefore - quantity;
      item.stock = stockAfter;

      await db.query(
        `INSERT INTO transactions (item_id, type, quantity, stock_before, stock_after, note, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          type,
          quantity,
          stockBefore,
          stockAfter,
          randomFrom(type === 'in' ? notesIn : notesOut),
          randomFrom(users),
          time,
        ]
      );

      totalTransactions++;
    }
  }

  const almostEmptyItems = savedItems.filter((item) => !item.maintenance && item.stock > item.min_stock).slice(0, 3);

  for (const item of almostEmptyItems) {
    const quantity = item.stock - item.min_stock + 1;
    const stockBefore = item.stock;
    item.stock = stockBefore - quantity;

    await db.query(
      `INSERT INTO transactions (item_id, type, quantity, stock_before, stock_after, note, created_by, created_at)
       VALUES (?, 'out', ?, ?, ?, 'Kebutuhan proyek', ?, ?)`,
      [item.id, quantity, stockBefore, item.stock, randomFrom(users), new Date()]
    );

    totalTransactions++;
  }

  for (const item of savedItems) {
    await db.query('UPDATE items SET stock = ?, status = ? WHERE id = ?', [
      item.stock,
      determineStatus(item.stock, item.min_stock, item.maintenance),
      item.id,
    ]);
  }

  console.log(`Seeder selesai: ${savedItems.length} barang, ${totalTransactions} transaksi`);
  await db.end();
}

seed().catch((error) => {
  console.error('Seeder gagal:', error.message);
  process.exit(1);
});
