import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { decorateAttribute } from '@lib/decorators/helpers/decorateAttribute';
import Dynamode from '@lib/dynamode/index';

import { MockEntity, mockInstance } from '../../../fixtures';

describe('Decorators', () => {
  let registerAttributeSpy = vi.spyOn(Dynamode.storage, 'registerAttribute');

  beforeEach(() => {
    registerAttributeSpy = vi.spyOn(Dynamode.storage, 'registerAttribute');
    registerAttributeSpy.mockReturnValue(undefined);
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

      expect(registerAttributeSpy).toBeCalledWith(MockEntity.name, 'gsiKey', {
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
