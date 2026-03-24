exports.errorhandler = (err, req, res, next) => {
  // Log the full stack trace
  console.error(err.stack);
  // Dynamic: use err.statusCode if exists, else 500
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: "server error",
    error: err.message,
  });
};
