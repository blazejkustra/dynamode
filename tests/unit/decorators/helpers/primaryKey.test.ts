import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as decorateAttribute from '@lib/decorators/helpers/decorateAttribute';
import {
  numberPartitionKey,
  numberSortKey,
  stringPartitionKey,
  stringSortKey,
} from '@lib/decorators/helpers/primaryKey';

describe('Decorators', () => {
  let decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');

  beforeEach(() => {
    decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');
    decorateAttributeSpy.mockReturnValue(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('stringPartitionKey', async () => {
    test('Should call decorateAttribute with String attribute type + options', async () => {
      stringPartitionKey();
      stringPartitionKey({ prefix: 'PREFIX', suffix: 'SUFFIX' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, String, 'partitionKey', undefined);
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(2, String, 'partitionKey', {
        prefix: 'PREFIX',
        suffix: 'SUFFIX',
      });
    });
  });

  describe('numberPartitionKey', async () => {
    test('Should call decorateAttribute with Number attribute type', async () => {
      numberPartitionKey();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Number, 'partitionKey');
    });
  });

  describe('stringSortKey', async () => {
    test('Should call decorateAttribute with String attribute type + options', async () => {
      stringSortKey();
      stringSortKey({ prefix: 'PREFIX', suffix: 'SUFFIX' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, String, 'sortKey', undefined);
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(2, String, 'sortKey', {
        prefix: 'PREFIX',
        suffix: 'SUFFIX',
      });
    });
  });

  describe('numberSortKey', async () => {
    test('Should call decorateAttribute with Number attribute type', async () => {
      numberSortKey();
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Number, 'sortKey');
    });
  });
});
