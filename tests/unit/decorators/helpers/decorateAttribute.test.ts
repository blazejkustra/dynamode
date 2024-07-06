import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { decorateAttribute } from '@lib/decorators/helpers/decorateAttribute';
import Dynamode from '@lib/dynamode/index';

import { MockEntity, mockInstance } from '../../../fixtures';

describe('Decorators', () => {
  let registerAttributeSpy = vi.spyOn(Dynamode.storage, 'registerAttribute');
  let registerIndexSpy = vi.spyOn(Dynamode.storage, 'registerIndex');

  beforeEach(() => {
    registerAttributeSpy = vi.spyOn(Dynamode.storage, 'registerAttribute');
    registerAttributeSpy.mockReturnValue(undefined);

    registerIndexSpy = vi.spyOn(Dynamode.storage, 'registerIndex');
    registerIndexSpy.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('decorateAttribute', async () => {
    test('Should call storage registerAttribute method', async () => {
      decorateAttribute(String, 'attribute')(mockInstance, 'string');

      expect(registerAttributeSpy).toBeCalledWith(MockEntity.name, 'string', {
        propertyName: 'string',
        type: String,
        role: 'attribute',
      });
    });

    test('Should call storage registerAttribute method with additional options', async () => {
      decorateAttribute(String, 'gsiPartitionKey', {
        prefix: 'PREFIX',
        suffix: 'SUFFIX',
        indexName: 'GSI',
      })(mockInstance, 'gsiKey');

      expect(registerIndexSpy).toBeCalledWith(MockEntity.name, 'gsiKey', {
        propertyName: 'gsiKey',
        type: String,
        role: 'index',
        indexes: [{ name: 'GSI', role: 'gsiPartitionKey' }],
        prefix: 'PREFIX',
        suffix: 'SUFFIX',
      });
    });

    test('Should call storage registerAttribute method with additional options', async () => {
      expect(() =>
        decorateAttribute(String, 'gsiPartitionKey', {
          prefix: 'PREFIX',
          suffix: 'SUFFIX',
        })(mockInstance, 'gsiKey'),
      ).toThrowError('Index name is required for gsiPartitionKey attribute');
    });
  });
});
