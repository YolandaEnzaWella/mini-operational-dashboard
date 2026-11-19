const HttpError = require('../helpers/HttpError');

function notFound(req, res) {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
}

function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);

  return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
}

module.exports = { notFound, errorHandler };
