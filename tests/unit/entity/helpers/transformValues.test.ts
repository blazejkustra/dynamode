import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Dynamode from '@lib/dynamode/index';
import { prefixSuffixValue, transformDateValue, truncateValue } from '@lib/entity/helpers/transformValues';
import { InvalidParameter } from '@lib/utils';

import { MockEntity } from '../../../fixtures';

describe('Prefix and suffix entity helpers', () => {
  let getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes');

  beforeEach(() => {
    vi.spyOn(Dynamode.separator, 'get').mockReturnValue(':');
    getEntityAttributesSpy = vi.spyOn(Dynamode.storage, 'getEntityAttributes');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('prefixSuffixValue', async () => {
    test('Should return plain value if value type is other than string', async () => {
      expect(prefixSuffixValue(MockEntity, 'number', 1)).toEqual(1);
      expect(prefixSuffixValue(MockEntity, 'object', {})).toEqual({});
    });

    test('Should properly add prefix and suffix with separators', async () => {
      getEntityAttributesSpy.mockReturnValue({
        string: {
          propertyName: 'string',
          type: String,
          role: 'attribute',
          prefix: 'PREFIX',
          suffix: 'SUFFIX',
        },
      });
      expect(prefixSuffixValue(MockEntity, 'string', 'value')).toEqual('PREFIX:value:SUFFIX');
      expect(prefixSuffixValue(MockEntity, 'string', 'value1:value2')).toEqual('PREFIX:value1:value2:SUFFIX');
      expect(getEntityAttributesSpy).toBeCalledWith(MockEntity.name);
    });

    test('Should properly add prefix and without suffix', async () => {
      getEntityAttributesSpy.mockReturnValue({
        string: {
          propertyName: 'string',
          type: String,
          role: 'attribute',
          prefix: 'PREFIX',
        },
      });
      expect(prefixSuffixValue(MockEntity, 'string', 'value')).toEqual('PREFIX:value');
      expect(prefixSuffixValue(MockEntity, 'string', 'value1:value2')).toEqual('PREFIX:value1:value2');
      expect(getEntityAttributesSpy).toBeCalledWith(MockEntity.name);
    });

    test('Should properly add suffix without prefix', async () => {
      getEntityAttributesSpy.mockReturnValue({
        string: {
          propertyName: 'string',
          type: String,
          role: 'attribute',
          suffix: 'SUFFIX',
        },
      });
      expect(prefixSuffixValue(MockEntity, 'string', 'value')).toEqual('value:SUFFIX');
      expect(prefixSuffixValue(MockEntity, 'string', 'value1:value2')).toEqual('value1:value2:SUFFIX');
      expect(getEntityAttributesSpy).toBeCalledWith(MockEntity.name);
    });
  });

  describe('truncateValue', async () => {
    test('Should return plain value if value type is other than string', async () => {
      expect(truncateValue(MockEntity, 'number', 1)).toEqual(1);
      expect(truncateValue(MockEntity, 'object', {})).toEqual({});
    });

    test('Should properly remove prefix and suffix with separators', async () => {
      getEntityAttributesSpy.mockReturnValue({
        string: {
          propertyName: 'string',
          type: String,
          role: 'attribute',
          prefix: 'PREFIX',
          suffix: 'SUFFIX',
        },
      });
      expect(truncateValue(MockEntity, 'string', 'PREFIX:value:SUFFIX')).toEqual('value');
      expect(truncateValue(MockEntity, 'string', 'PREFIX:value1:value2:SUFFIX')).toEqual('value1:value2');
      expect(getEntityAttributesSpy).toBeCalledWith(MockEntity.name);
    });

    test('Should properly remove prefix with separator', async () => {
      getEntityAttributesSpy.mockReturnValue({
        string: {
          propertyName: 'string',
          type: String,
          role: 'attribute',
          prefix: 'PREFIX',
        },
      });
      expect(truncateValue(MockEntity, 'string', 'PREFIX:value')).toEqual('value');
      expect(truncateValue(MockEntity, 'string', 'PREFIX:value1:value2')).toEqual('value1:value2');
      expect(getEntityAttributesSpy).toBeCalledWith(MockEntity.name);
    });

    test('Should properly remove suffix with separator', async () => {
      getEntityAttributesSpy.mockReturnValue({
        string: {
          propertyName: 'string',
          type: String,
          role: 'attribute',
          suffix: 'SUFFIX',
        },
      });
      expect(truncateValue(MockEntity, 'string', 'value:SUFFIX')).toEqual('value');
      expect(truncateValue(MockEntity, 'string', 'value1:value2:SUFFIX')).toEqual('value1:value2');
      expect(getEntityAttributesSpy).toBeCalledWith(MockEntity.name);
    });
  });

  describe('transformDateValue', async () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('Should return plain value if value type is other than date', async () => {
      expect(transformDateValue(MockEntity, 'number', 1)).toEqual(1);
      expect(transformDateValue(MockEntity, 'object', {})).toEqual({});
    });

    test('Should transform Date into ISO string', async () => {
      expect(transformDateValue(MockEntity, 'strDate', new Date())).toEqual(new Date().toISOString());
    });

    test('Should transform Date into number timestamp', async () => {
      expect(transformDateValue(MockEntity, 'numDate', new Date())).toEqual(new Date().getTime());
    });

    test('Should throw an error for a Date with wrong role', async () => {
      expect(() => transformDateValue(MockEntity, 'number', new Date())).toThrow(InvalidParameter);
    });

    test('Should throw an error for a Date with wrong attribute type', async () => {
      getEntityAttributesSpy.mockReturnValue({
        strDate: {
          propertyName: 'strDate',
          type: Set,
          role: 'date',
        },
      });

      expect(() => transformDateValue(MockEntity, 'strDate', new Date())).toThrow(InvalidParameter);
    });
  });
});
