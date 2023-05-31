export const createError = (defaultMessage: string, errorName: string) =>
  class DynamodeError extends Error {
    name: string;
    message: string;

    constructor(message?: string) {
      super();
      this.name = errorName;
      this.message = message || defaultMessage;
      Object.setPrototypeOf(this, DynamodeError.prototype);
    }
  };

export const NotFoundError = createError('Item not found', 'NotFoundError');
export const InvalidParameter = createError('Invalid Parameter', 'InvalidParameter');
export const ValidationError = createError('Validation failed', 'ValidationError');
export const ConflictError = createError('Conflict', 'ConflictError');
export const DynamodeStorageError = createError('Dynamode storage failed', 'DynamodeStorageError');
