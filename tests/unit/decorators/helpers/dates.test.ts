import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { numberDate, stringDate } from '@lib/decorators/helpers/dates';
import * as decorateAttribute from '@lib/decorators/helpers/decorateAttribute';

describe('Decorators', () => {
  let decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');

  beforeEach(() => {
    decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');
    decorateAttributeSpy.mockReturnValue(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('stringDate', async () => {
    test('Should call decorateAttribute with String attribute type + options', async () => {
      stringDate();
      stringDate({ prefix: 'PREFIX', suffix: 'SUFFIX' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, String, 'date', undefined);
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(2, String, 'date', { prefix: 'PREFIX', suffix: 'SUFFIX' });
    });
  });

  describe('numberDate', async () => {
    test('Should call decorateAttribute with Number attribute type', async () => {
      numberDate();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Number, 'date');
    });
  });
});
