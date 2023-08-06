import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  deepEqual,
  duplicatesInArray,
  insertBetween,
  isEmpty,
  isNotEmpty,
  isNotEmptyArray,
  isNotEmptyString,
  mergeObjects,
  splitListPathReference,
  timeout,
} from '@lib/utils';

describe('Helpers', () => {
  describe('duplicatesInArray', () => {
    test('Should return true if array has duplicates', async () => {
      expect(duplicatesInArray([1, 2, 3, 1])).toEqual(true);
      expect(duplicatesInArray(['a', 'b', 'c', 'c'])).toEqual(true);
    });

    test('Should return false if array has no duplicates', async () => {
      expect(duplicatesInArray([1, 2, 3])).toEqual(false);
      expect(duplicatesInArray(['a', 'b', 'c'])).toEqual(false);
    });

    test('Should return false if array is empty', async () => {
      expect(duplicatesInArray([])).toEqual(false);
    });
  });

  describe('isEmpty', () => {
    test('Should return true if object is empty', async () => {
      expect(isEmpty({})).toEqual(true);
    });

    test('Should return false if object is not empty', async () => {
      expect(isEmpty({ test: '' })).toEqual(false);
    });
  });

  describe('isNotEmpty', () => {
    test('Should return true if object is not empty', async () => {
      expect(isNotEmpty({ test: '' })).toEqual(true);
    });

    test('Should return false if object is empty', async () => {
      expect(isNotEmpty({})).toEqual(false);
    });

    test('Should return false if argument is undefined', async () => {
      expect(isNotEmpty(undefined)).toEqual(false);
      expect(isNotEmpty()).toEqual(false);
    });
  });

  describe('isNotEmptyString', () => {
    test('Should return true if string is not empty', async () => {
      expect(isNotEmptyString('1')).toEqual(true);
    });

    test('Should return false if string is empty', async () => {
      expect(isNotEmptyString('')).toEqual(false);
    });
  });

  describe('isNotEmptyArray', () => {
    test('Should return true if array is not empty', async () => {
      expect(isNotEmptyArray(['1'])).toEqual(true);
    });

    test('Should return false if array is empty', async () => {
      expect(isNotEmptyArray([])).toEqual(false);
    });

    test('Should return false if array is not defined', async () => {
      expect(isNotEmptyArray()).toEqual(false);
      expect(isNotEmptyArray(undefined)).toEqual(false);
    });
  });

  describe('insertBetween', () => {
    test('Should insert value between values in array', async () => {
      expect(insertBetween([1, 1, 1, 1], 2)).toEqual([1, 2, 1, 2, 1, 2, 1]);
      expect(insertBetween([1, 1, 1, 1], [2])).toEqual([1, 2, 1, 2, 1, 2, 1]);
      expect(insertBetween([1, 1, 1, 1], [2, 2])).toEqual([1, 2, 2, 1, 2, 2, 1, 2, 2, 1]);
      expect(insertBetween(['a', 'a'], 'b')).toEqual(['a', 'b', 'a']);
    });

    test('Should not insert if array lenght is less or equal 1', async () => {
      expect(insertBetween([], 'b')).toEqual([]);
      expect(insertBetween(['a'], 'b')).toEqual(['a']);
      expect(insertBetween([1], [1, 1, 1])).toEqual([1]);
    });
  });

  describe('splitListPathReference', () => {
    test('Should split the string before first opening bracket', async () => {
      expect(splitListPathReference('key[1]')).toEqual(['key', '[1]']);
      expect(splitListPathReference('key[1][2][3]')).toEqual(['key', '[1][2][3]']);
      expect(splitListPathReference('another_key[123]')).toEqual(['another_key', '[123]']);
    });

    test('Should not split the string if there are no brackets', async () => {
      expect(splitListPathReference('key')).toEqual(['key', '']);
      expect(splitListPathReference('another_key')).toEqual(['another_key', '']);
    });
  });

  describe('deepEqual', () => {
    test('Primitive variables should be deeply equal', async () => {
      expect(deepEqual(1, 1)).toEqual(true);
      expect(deepEqual('1', '1')).toEqual(true);
      expect(deepEqual(true, true)).toEqual(true);
    });

    test('Different primitive variables should not be deeply equal', async () => {
      expect(deepEqual(1, 2)).toEqual(false);
      expect(deepEqual('1', '2')).toEqual(false);
      expect(deepEqual(true, false)).toEqual(false);
    });

    test('Non primitive variables should be deeply equal', async () => {
      expect(deepEqual({}, {})).toEqual(true);
      expect(deepEqual({ a: { b: { c: 10 } } }, { a: { b: { c: 10 } } })).toEqual(true);
      expect(deepEqual([], [])).toEqual(true);
    });

    test('Non primitive variables with different structures should not be deeply equal', async () => {
      expect(deepEqual({}, { a: 1 })).toEqual(false);
      expect(deepEqual([1], [])).toEqual(false);
      expect(
        deepEqual(
          { '1': { '1': { '1': 'e', '2': 'e' }, '2': 'e' } },
          { '1': { '1': { '1': 'f', '3': 'f' } }, '3': 'f' },
        ),
      ).toEqual(false);
      expect(deepEqual({ a: { b: { c: 10 } } }, { a: { b: { c: 11 } } })).toEqual(false);
    });
  });

  describe('mergeObjects', () => {
    test('Should correctly merge empty objects', async () => {
      const a = {};
      const b = {};
      expect(mergeObjects(a, b)).toEqual({});
    });

    test('Should correctly merge object with empty object', async () => {
      const a = { '1': 'a' };
      const b = {};
      expect(mergeObjects(a, b)).toEqual(a);
      expect(mergeObjects(b, a)).toEqual(a);
    });

    test('Should correctly merge non empty objects', async () => {
      const a: Record<string, unknown> = { '1': 'a' };
      const b: Record<string, unknown> = { '2': 'b' };
      expect(mergeObjects(a, b)).toEqual({ '1': 'a', '2': 'b' });

      const c: Record<string, unknown> = { '1': 'c' };
      const d: Record<string, unknown> = { '1': 'd' };
      expect(mergeObjects(c, d)).toEqual({ '1': 'd' });
      expect(mergeObjects(d, c)).toEqual({ '1': 'c' });

      const e: Record<string, unknown> = { '1': { '1': { '1': 'e', '2': 'e' }, '2': 'e' } };
      const f: Record<string, unknown> = { '1': { '1': { '1': 'f', '3': 'f' } }, '3': 'f' };
      expect(mergeObjects(e, f)).toEqual({ '1': { '1': { '1': 'f', '2': 'e', '3': 'f' }, '2': 'e' }, '3': 'f' });
      expect(mergeObjects(f, e)).toEqual({ '1': { '1': { '1': 'e', '2': 'e', '3': 'f' }, '2': 'e' }, '3': 'f' });
    });
  });

  describe.todo('timeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(global, 'setTimeout').mockImplementation((cb) => cb() as any);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('Should call setTimeout if argument is greater than 0', async () => {
      expect(await timeout(1)).toEqual(undefined);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.anything(), 1);
    });

    test('Should call setTimeout if argument equals 0', async () => {
      expect(await timeout(0)).toEqual(undefined);
      expect(setTimeout).not.toHaveBeenCalled();
    });
  });
});
