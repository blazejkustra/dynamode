import { numberDate, stringDate } from '@lib/decorators/helpers/dates';
import {
  numberGsiPartitionKey,
  numberGsiSortKey,
  stringGsiPartitionKey,
  stringGsiSortKey,
} from '@lib/decorators/helpers/gsi';
import { numberLsiSortKey, stringLsiSortKey } from '@lib/decorators/helpers/lsi';
import { array, boolean, map, number, object, set, string } from '@lib/decorators/helpers/other';
import { prefix, suffix } from '@lib/decorators/helpers/prefixSuffix';
import {
  numberPartitionKey,
  numberSortKey,
  stringPartitionKey,
  stringSortKey,
} from '@lib/decorators/helpers/primaryKey';

const attribute = {
  string,
  number,
  boolean,
  object,
  array,
  set,
  map,

  date: {
    string: stringDate,
    number: numberDate,
  },
  partitionKey: {
    string: stringPartitionKey,
    number: numberPartitionKey,
  },
  sortKey: {
    string: stringSortKey,
    number: numberSortKey,
  },
  gsi: {
    partitionKey: {
      string: stringGsiPartitionKey,
      number: numberGsiPartitionKey,
    },
    sortKey: {
      string: stringGsiSortKey,
      number: numberGsiSortKey,
    },
  },
  lsi: {
    sortKey: {
      string: stringLsiSortKey,
      number: numberLsiSortKey,
    },
  },

  prefix,
  suffix,
};

export default attribute;
