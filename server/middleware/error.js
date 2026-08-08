const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

const errorHandler = (err, req, res, _next) => {
  console.error('Server Error:', err);
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    res.status(status).json({ error: 'Internal server error' });
  } else {
    res.status(status).json({ error: err.message || 'Request failed' });
  }
};

module.exports = { asyncHandler, notFound, errorHandler };
