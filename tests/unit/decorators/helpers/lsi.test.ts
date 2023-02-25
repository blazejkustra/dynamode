import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as decorateAttribute from '@lib/decorators/helpers/decorateAttribute';
import { numberLsiSortKey, stringLsiSortKey } from '@lib/decorators/helpers/lsi';

describe('Decorators', () => {
  let decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');

  beforeEach(() => {
    decorateAttributeSpy = vi.spyOn(decorateAttribute, 'decorateAttribute');
    decorateAttributeSpy.mockReturnValue(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('stringLsiSortKey', async () => {
    test('Should call decorateAttribute with String attribute type + options', async () => {
      stringLsiSortKey({ indexName: 'GSI' });
      stringLsiSortKey({ indexName: 'GSI', prefix: 'PREFIX', suffix: 'SUFFIX' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, String, 'lsiSortKey', { indexName: 'GSI' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(2, String, 'lsiSortKey', {
        indexName: 'GSI',
        prefix: 'PREFIX',
        suffix: 'SUFFIX',
      });
    });
  });

  describe('numberLsiSortKey', async () => {
    test('Should call decorateAttribute with Number attribute type', async () => {
      numberLsiSortKey({ indexName: 'GSI' });
      expect(decorateAttributeSpy).toHaveBeenNthCalledWith(1, Number, 'lsiSortKey', { indexName: 'GSI' });
    });
  });
});
