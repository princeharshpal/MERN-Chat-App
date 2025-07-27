const errorMiddleware = (err, req, res, next) => {
  err.statusCode ||= 500;
  err.message ||= "Internal server error";

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

const TryCatch = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    next(error);
  }
};

export { errorMiddleware, TryCatch };
