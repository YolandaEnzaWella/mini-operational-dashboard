const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = {};

  result.array().forEach((error) => {
    if (!errors[error.path]) {
      errors[error.path] = [];
    }

    errors[error.path].push(error.msg);
  });

  return res.status(422).json({
    message: 'Data yang dikirim tidak valid',
    errors,
  });
}

module.exports = validate;
