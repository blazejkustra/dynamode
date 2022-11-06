import { afterEach, describe, expect, test, vi } from 'vitest';

import { duplicatesInArray, isEmpty, isNotEmpty, isNotEmptyArray, isNotEmptyString, mergeObjects, timeout } from '@lib/utils';

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

  describe('timeout', () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('Should call setTimeout if argument is greater than 0', async () => {
      expect(await timeout(1)).toEqual(undefined);
      expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.anything(), 1);
    });

    test('Should call setTimeout if argument equals 0', async () => {
      expect(await timeout(0)).toEqual(undefined);
      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });
  });
});
