import { ApiError } from './ApiError.js';
import { ApiResponse } from './ApiResponse.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';

  //console.error(message);
  //console.error(statusCode);
  //console.error(err.response.data);

  if (err instanceof ApiError) {
    return res.status(statusCode).json({
      statusCode,
      data: null,
      message,
      success: false,
      errors: err.errors || [],
    });
  }

  return res.status(statusCode).json(new ApiResponse(statusCode, null, message));
};

export { errorHandler };
