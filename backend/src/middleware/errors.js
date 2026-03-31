function notFoundHandler(req, res) {
  res.status(404).json({ 
    message: "Route not found",
    method: req.method,
    url: req.originalUrl 
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };

