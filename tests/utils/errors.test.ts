import { describe, expect, test } from 'vitest';

import { createError } from '@lib/utils';

describe('Helpers', () => {
  describe('createError', () => {
    const message = 'message';
    const name = 'name';
    const CustomError = createError(message, name);

    test('Should create error instance', async () => {
      const errorInstance = new CustomError();
      expect(errorInstance.message).toEqual(message);
      expect(errorInstance.name).toEqual(name);
    });

    test('Should create error instance with custom message', async () => {
      const customMessage = 'custom message';
      const errorInstance = new CustomError(customMessage);
      expect(errorInstance.message).toEqual(customMessage);
      expect(errorInstance.name).toEqual(name);
    });
  });
});
