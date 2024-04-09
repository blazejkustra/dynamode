import { ValueOf } from 'type-fest';

import {
  CreateTableCommandInput,
  DeleteTableCommandInput,
  ProvisionedThroughput,
  TableDescription,
} from '@aws-sdk/client-dynamodb';
import Entity from '@lib/entity';
import { ReturnOption } from '@lib/entity/types';

// Table metadata types

type EntityKey<E extends typeof Entity> = keyof InstanceType<E> extends string ? keyof InstanceType<E> : never;

type TableIndexesMetadata<E extends typeof Entity> = {
  [indexName: string]: {
    partitionKey?: EntityKey<E>;
    sortKey?: EntityKey<E>;
  };
};

export type Metadata<E extends typeof Entity> = {
  tableName: string;

  partitionKey: EntityKey<E>;
  sortKey?: EntityKey<E>;
  indexes?: TableIndexesMetadata<E>;

  createdAt?: EntityKey<E>;
  updatedAt?: EntityKey<E>;
};

type SK<M extends Metadata<E>, E extends typeof Entity> = M['sortKey'];
type PK<M extends Metadata<E>, E extends typeof Entity> = M['partitionKey'];
type Idx<M extends Metadata<E>, E extends typeof Entity> = M['indexes'];

export type TablePrimaryKey<M extends Metadata<E>, E extends typeof Entity> = Pick<
  InstanceType<E>,
  Extract<EntityKey<E>, SK<M, E> extends string ? PK<M, E> | SK<M, E> : PK<M, E>>
>;

export type TableRetrieverLastKey<M extends Metadata<E>, E extends typeof Entity> = Pick<
  InstanceType<E>,
  Extract<EntityKey<E>, TablePartitionKeys<M, E> | TableSortKeys<M, E>>
>;

export type TableIndexNames<M extends Metadata<E>, E extends typeof Entity> = keyof Idx<M, E> extends string
  ? keyof Idx<M, E>
  : never;
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

// TableManager.create

export type TableCreateOptions = {
  extraInput?: Partial<CreateTableCommandInput>;
  return?: ReturnOption;
  throughput?: {
    read: number;
    write: number;
  };
  tags?: Record<string, string>;
  deletionProtection?: boolean;
};

// TableManager.deleteTable

export type TableDeleteOptions = {
  return?: ReturnOption;
  extraInput?: Partial<DeleteTableCommandInput>;
};

// TableManager.createIndex

export type TableCreateIndexOptions = {
  extraInput?: Partial<CreateTableCommandInput>;
  return?: ReturnOption;
  throughput?: {
    read: number;
    write: number;
  };
};

// TableManager.deleteIndex

export type TableDeleteIndexOptions = {
  extraInput?: Partial<CreateTableCommandInput>;
  return?: ReturnOption;
};

// TableManager.validate

export type TableValidateOptions = {
  extraInput?: Partial<CreateTableCommandInput>;
  return?: ReturnOption;
};

// helpers

type KeySchema = { name: string; type: string };
type AttributeDefinition = { name: string; type: string };
type IndexInformation = {
  indexName: string;
  keySchema: KeySchema[];
  itemCount: number;
};

export type TableData = {
  tableName: string;
  status: string;
  attributeDefinitions: AttributeDefinition[];
  keySchema: KeySchema[];
  itemCount: number;
  tableSizeBytes: number;
  billingMode?: string;
  creationTime: Date;
  globalSecondaryIndexes: IndexInformation[];
  localSecondaryIndexes: IndexInformation[];
};

// helpers.builders

export type BuildIndexCreate = {
  indexName: string;
  partitionKey: string;
  sortKey: string | undefined;
  throughput?: ProvisionedThroughput;
};

// helpers.validator

export type ValidateTableSync<M extends Metadata<TE>, TE extends typeof Entity> = {
  metadata: M;
  tableNameEntity: string;
  table?: TableDescription;
};
