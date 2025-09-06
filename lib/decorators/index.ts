import customName from '@lib/decorators/helpers/customName';
import { numberDate, stringDate } from '@lib/decorators/helpers/dates';
import {
  numberGsiPartitionKey,
  numberGsiSortKey,
  stringGsiPartitionKey,
  stringGsiSortKey,
} from '@lib/decorators/helpers/gsi';
import { numberLsiSortKey, stringLsiSortKey } from '@lib/decorators/helpers/lsi';
import { array, binary, boolean, map, number, object, set, string } from '@lib/decorators/helpers/other';
import { prefix, suffix } from '@lib/decorators/helpers/prefixSuffix';
import {
  numberPartitionKey,
  numberSortKey,
  stringPartitionKey,
  stringSortKey,
} from '@lib/decorators/helpers/primaryKey';

/**
 * Attribute decorators for defining entity properties.
 *
 * These decorators are used to define the structure and behavior of entity properties
 * in Dynamode. They specify the data type, key roles, and index configurations.
 *
 * @example
 * ```typescript
 * class User extends Entity {
 *   ＠attribute.partitionKey.string()
 *   id: string;
 *
 *   ＠attribute.sortKey.number()
 *   createdAt: number;
 *
 *   ＠attribute.string()
 *   name: string;
 *
 *   ＠attribute.gsi.partitionKey.string({ indexName: 'NameIndex' })
 *   nameIndex: string;
 *
 *   ＠attribute.lsi.sortKey.string({ indexName: 'StatusIndex' })
 *   status: string;
 * }
 * ```
 *
 * @see {@link https://blazejkustra.github.io/dynamode/docs/guide/entity/decorators} for more information
 */
const attribute = {
  /** String attribute decorators */
  string,
  /** Number attribute decorators */
  number,
  /** Boolean attribute decorators */
  boolean,
  /** Object attribute decorators */
  object,
  /** Array attribute decorators */
  array,
  /** Set attribute decorators */
  set,
  /** Map attribute decorators */
  map,
  /** Binary attribute decorators */
  binary,

  /** Date attribute decorators */
  date: {
    /** String-based date decorators */
    string: stringDate,
    /** Number-based date decorators */
    number: numberDate,
  },
  /** Partition key decorators */
  partitionKey: {
    /** String partition key decorators */
    string: stringPartitionKey,
    /** Number partition key decorators */
    number: numberPartitionKey,
  },
  /** Sort key decorators */
  sortKey: {
    /** String sort key decorators */
    string: stringSortKey,
    /** Number sort key decorators */
    number: numberSortKey,
  },
  /** Global Secondary Index (GSI) decorators */
  gsi: {
    /** GSI partition key decorators */
    partitionKey: {
      /** String GSI partition key decorators */
      string: stringGsiPartitionKey,
      /** Number GSI partition key decorators */
      number: numberGsiPartitionKey,
    },
    /** GSI sort key decorators */
    sortKey: {
      /** String GSI sort key decorators */
      string: stringGsiSortKey,
      /** Number GSI sort key decorators */
      number: numberGsiSortKey,
    },
  },
  /** Local Secondary Index (LSI) decorators */
  lsi: {
    /** LSI sort key decorators */
    sortKey: {
      /** String LSI sort key decorators */
      string: stringLsiSortKey,
      /** Number LSI sort key decorators */
      number: numberLsiSortKey,
    },
  },

  /** Prefix decorator for adding prefixes to attribute values */
  prefix,
  /** Suffix decorator for adding suffixes to attribute values */
  suffix,
};

/**
 * Entity decorators for defining entity-level configurations.
 *
 * @example
 * ```typescript
 * @entity.customName('CustomUser')
 * class User extends Entity {
 *   ＠attribute.partitionKey.string()
 *   id: string;
 * }
 * ```
 */
const entity = {
  /** Custom name decorator for entities */
  customName,
};

export default attribute;
export { entity };
