import { ValueOf } from 'type-fest';

import Entity from '@lib/entity';

// Table metadata types

type TableIndexesMetadata<E extends typeof Entity = typeof Entity> = {
  [indexName: string]: {
    partitionKey?: keyof InstanceType<E>;
    sortKey?: keyof InstanceType<E>;
  };
};

export type Metadata<E extends typeof Entity = typeof Entity> = {
  tableName: string;

  partitionKey: keyof InstanceType<E>;
  sortKey?: keyof InstanceType<E>;
  indexes?: TableIndexesMetadata<E>;

  createdAt?: keyof InstanceType<E>;
  updatedAt?: keyof InstanceType<E>;
};

type SK<M extends Metadata> = M['sortKey'];
type PK<M extends Metadata> = M['partitionKey'];
type Ids<M extends Metadata> = M['indexes'];

export type TablePrimaryKey<M extends Metadata<E>, E extends typeof Entity> = Pick<
  InstanceType<E>,
  Extract<keyof InstanceType<E>, SK<M> extends string ? PK<M> | SK<M> : PK<M>>
>;

export type TableIndexNames<M extends Metadata> = keyof Ids<M>;
export type TablePartitionKeys<M extends Metadata> =
  | PK<M>
  | ValueOf<{
      [K in keyof Ids<M>]: Ids<M> extends TableIndexesMetadata
        ? Ids<M>[K]['partitionKey'] extends string
          ? Ids<M>[K]['partitionKey']
          : never
        : never;
    }>;
export type TableSortKeys<M extends Metadata> =
  | SK<M>
  | ValueOf<{
      [K in keyof Ids<M>]: Ids<M> extends TableIndexesMetadata
        ? Ids<M>[K]['sortKey'] extends string
          ? Ids<M>[K]['sortKey']
          : never
        : never;
    }>;
