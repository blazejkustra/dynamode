import { describe, expect, test } from 'vitest';

import attribute from '@lib/decorators';
import { numberDate, stringDate } from '@lib/decorators/helpers/dates';
import {
  numberGsiPartitionKey,
  numberGsiSortKey,
  stringGsiPartitionKey,
  stringGsiSortKey,
} from '@lib/decorators/helpers/gsi';
import { numberLsiSortKey, stringLsiSortKey } from '@lib/decorators/helpers/lsi';
import { array, boolean, number, object, set, string } from '@lib/decorators/helpers/other';
import { prefix, suffix } from '@lib/decorators/helpers/prefixSuffix';
import {
  numberPartitionKey,
  numberSortKey,
  stringPartitionKey,
  stringSortKey,
} from '@lib/decorators/helpers/primaryKey';

describe('Decorators', () => {
  describe('attribute', async () => {
    test('Should return proper basic attribute decorators', async () => {
      expect(attribute.string).toEqual(string);
      expect(attribute.number).toEqual(number);
      expect(attribute.boolean).toEqual(boolean);
      expect(attribute.object).toEqual(object);
      expect(attribute.array).toEqual(array);
      expect(attribute.set).toEqual(set);
    });

    test('Should return proper date attribute decorators', async () => {
      expect(attribute.date.string).toEqual(stringDate);
      expect(attribute.date.number).toEqual(numberDate);
    });

    test('Should return proper partitionKey attribute decorators', async () => {
      expect(attribute.partitionKey.string).toEqual(stringPartitionKey);
      expect(attribute.partitionKey.number).toEqual(numberPartitionKey);
    });

    test('Should return proper sortKey attribute decorators', async () => {
      expect(attribute.sortKey.string).toEqual(stringSortKey);
      expect(attribute.sortKey.number).toEqual(numberSortKey);
    });

    test('Should return proper gsi attribute decorators', async () => {
      expect(attribute.gsi.partitionKey.string).toEqual(stringGsiPartitionKey);
      expect(attribute.gsi.partitionKey.number).toEqual(numberGsiPartitionKey);
      expect(attribute.gsi.sortKey.string).toEqual(stringGsiSortKey);
      expect(attribute.gsi.sortKey.number).toEqual(numberGsiSortKey);
    });

    test('Should return proper lsi attribute decorators', async () => {
      expect(attribute.lsi.sortKey.string).toEqual(stringLsiSortKey);
      expect(attribute.lsi.sortKey.number).toEqual(numberLsiSortKey);
    });

    test('Should return proper prefix/suffix attribute decorators', async () => {
      expect(attribute.prefix).toEqual(prefix);
      expect(attribute.suffix).toEqual(suffix);
    });
  });
});
