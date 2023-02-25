import { describe, expect, test, vi } from 'vitest';

import { prefix, suffix } from '@lib/decorators/helpers/prefixSuffix';
import Dynamode from '@lib/dynamode/index';

import { MockEntity, mockInstance } from '../../../mocks';

describe('Decorators', () => {
  describe('prefix', async () => {
    test('Should call storage updateAttributePrefix method', async () => {
      const updateAttributePrefixSpy = vi.spyOn(Dynamode.storage, 'updateAttributePrefix');
      updateAttributePrefixSpy.mockReturnValue(undefined);
      prefix('PREFIX')(mockInstance, 'string');
      expect(updateAttributePrefixSpy).toBeCalledWith(MockEntity.name, 'string', 'PREFIX');
    });
  });

  describe('suffix', async () => {
    test('Should call storage updateAttributeSuffix method', async () => {
      const updateAttributeSuffixSpy = vi.spyOn(Dynamode.storage, 'updateAttributeSuffix');
      updateAttributeSuffixSpy.mockReturnValue(undefined);
      suffix('SUFFIX')(mockInstance, 'string');
      expect(updateAttributeSuffixSpy).toBeCalledWith(MockEntity.name, 'string', 'SUFFIX');
    });
  });
});
