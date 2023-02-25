import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as decorateAttribute from '@lib/decorators/helpers/decorateAttribute';
import {
  numberGsiPartitionKey,
  numberGsiSortKey,
  stringGsiPartitionKey,
  stringGsiSortKey,
} from '@lib/decorators/helpers/gsi';

describe('Decorators', () => {
  let decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');

  beforeEach(() => {
    decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');
    decorateAttributeSpy.mockReturnValue(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('stringGsiPartitionKey', async () => {
    test('Should call decorateAttribute with String attribute type + options', async () => {
      stringGsiPartitionKey({ indexName: 'GSI' });
      stringGsiPartitionKey({ indexName: 'GSI', prefix: 'PREFIX', suffix: 'SUFFIX' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, String, 'gsiPartitionKey', { indexName: 'GSI' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(2, String, 'gsiPartitionKey', {
        indexName: 'GSI',
        prefix: 'PREFIX',
        suffix: 'SUFFIX',
      });
    });
  });

  describe('numberGsiPartitionKey', async () => {
    test('Should call decorateAttribute with Number attribute type', async () => {
      numberGsiPartitionKey({ indexName: 'GSI' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Number, 'gsiPartitionKey', { indexName: 'GSI' });
    });
  });

  describe('stringGsiSortKey', async () => {
    test('Should call decorateAttribute with String attribute type + options', async () => {
      stringGsiSortKey({ indexName: 'GSI' });
      stringGsiSortKey({ indexName: 'GSI', prefix: 'PREFIX', suffix: 'SUFFIX' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, String, 'gsiSortKey', { indexName: 'GSI' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(2, String, 'gsiSortKey', {
        indexName: 'GSI',
        prefix: 'PREFIX',
        suffix: 'SUFFIX',
      });
    });
  });

  describe('numberGsiSortKey', async () => {
    test('Should call decorateAttribute with Number attribute type', async () => {
      numberGsiSortKey({ indexName: 'GSI' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Number, 'gsiSortKey', { indexName: 'GSI' });
    });
  });
});
