function determineStatus(stock, minStock, isMaintenance) {
  if (isMaintenance) {
    return 'Maintenance';
  }

  if (stock <= minStock) {
    return 'Low Stock';
  }

  return 'Available';
}

module.exports = { determineStatus };
