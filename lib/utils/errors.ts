export const createError = (defaultMessage: string, errorName: string) =>
  class CustomError extends Error {
    name: string;
    message: string;

    constructor(message?: string) {
      super();
      this.name = errorName;
      this.message = message || defaultMessage;
      Object.setPrototypeOf(this, CustomError.prototype);
      return this;
    }
  };

export const DefaultError = createError('Unexpected Error', 'DefaultError');
export const InvalidParameter = createError('Invalid Parameter', 'InvalidParameter');
export const ValidationError = createError('Validation failed', 'ValidationError');
export const NotFoundError = createError('Item not found', 'NotFoundError');
