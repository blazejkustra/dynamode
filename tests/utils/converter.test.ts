import { describe, expect, test, vi } from 'vitest';

import ddbConverter from '@lib/dynamode/converter';
import { fromDynamo, objectToDynamo, valueFromDynamo, valueToDynamo } from '@lib/utils';

const marshallSpy = vi.fn();
const convertToAttrSpy = vi.fn();
const convertToNativeSpy = vi.fn();
const unmarshallSpy = vi.fn();

vi.mock('@lib/dynamode/converter', () => ({
  default: {
    get: vi.fn().mockImplementation(() => ({
      marshall: marshallSpy,
      convertToAttr: convertToAttrSpy,
      convertToNative: convertToNativeSpy,
      unmarshall: unmarshallSpy,
    })),
  },
}));

describe('Helpers', () => {
  const converterGetSpy = vi.spyOn(ddbConverter, 'get');

  describe('objectToDynamo', () => {
    test("Should run converter's marshall function", async () => {
      objectToDynamo({ a: 1, b: 2 });
      expect(converterGetSpy).toHaveBeenCalled();
      expect(marshallSpy).toHaveBeenCalled();
    });
  });

  describe('valueToDynamo', () => {
    test("Should run converter's marshall function", async () => {
      valueToDynamo('value');
      expect(converterGetSpy).toHaveBeenCalled();
      expect(convertToAttrSpy).toHaveBeenCalled();
    });
  });

  describe('valueFromDynamo', () => {
    test("Should run converter's convertToNative function", async () => {
      valueFromDynamo({ S: '1' });
      expect(converterGetSpy).toHaveBeenCalled();
      expect(convertToAttrSpy).toHaveBeenCalled();
    });
  });

  describe('fromDynamo', () => {
    test("Should run converter's unmarshall function", async () => {
      fromDynamo({ prop: { S: '1' } });
      expect(converterGetSpy).toHaveBeenCalled();
      expect(convertToAttrSpy).toHaveBeenCalled();
    });
  });
});
