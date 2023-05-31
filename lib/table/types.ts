import { ValueOf } from 'type-fest';

import { CreateTableCommandInput } from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import { ReturnOption } from '@lib/entity/types';

// Table metadata types

type TableIndexesMetadata<E extends typeof Entity> = {
  [indexName: string]: {
    partitionKey?: keyof InstanceType<E>;
    sortKey?: keyof InstanceType<E>;
  };
};

export type Metadata<E extends typeof Entity> = {
  tableName: string;

  partitionKey: keyof InstanceType<E>;
  sortKey?: keyof InstanceType<E>;
  indexes?: TableIndexesMetadata<E>;
};

type SK<M extends Metadata<E>, E extends typeof Entity> = M['sortKey'];
type PK<M extends Metadata<E>, E extends typeof Entity> = M['partitionKey'];
type Idx<M extends Metadata<E>, E extends typeof Entity> = M['indexes'];

export type TablePrimaryKey<M extends Metadata<E>, E extends typeof Entity> = Pick<
  InstanceType<E>,
  Extract<keyof InstanceType<E>, SK<M, E> extends string ? PK<M, E> | SK<M, E> : PK<M, E>>
>;

export type TableIndexNames<M extends Metadata<E>, E extends typeof Entity> = keyof Idx<M, E>;
export type TablePartitionKeys<M extends Metadata<E>, E extends typeof Entity> =
  | PK<M, E>
  | ValueOf<{
      [K in keyof Idx<M, E>]: Idx<M, E> extends TableIndexesMetadata<E>
        ? Idx<M, E>[K]['partitionKey'] extends string
          ? Idx<M, E>[K]['partitionKey']
          : never
        : never;
    }>;
export type TableSortKeys<M extends Metadata<E>, E extends typeof Entity> =
  | SK<M, E>
  | ValueOf<{
      [K in keyof Idx<M, E>]: Idx<M, E> extends TableIndexesMetadata<E>
        ? Idx<M, E>[K]['sortKey'] extends string
          ? Idx<M, E>[K]['sortKey']
          : never
        : never;
    }>;

// tableManager.create

export interface TableCreateOptions {
  extraInput?: Partial<CreateTableCommandInput>;
  return?: ReturnOption;
  throughput?: {
    read: number;
    write: number;
  };
  tags?: Record<string, string>;
  deletionProtection?: boolean;
}

// tableManager.createIndex

export interface TableCreateIndexOptions {
  extraInput?: Partial<CreateTableCommandInput>;
  return?: ReturnOption;
  throughput?: {
    read: number;
    write: number;
  };
}

// tableManager.deleteIndex

export interface TableDeleteIndexOptions {
  extraInput?: Partial<CreateTableCommandInput>;
  return?: ReturnOption;
}

// tableManager.validate

export interface TableValidateOptions {
  extraInput?: Partial<CreateTableCommandInput>;
  return?: ReturnOption;
}
