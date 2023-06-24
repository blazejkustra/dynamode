import {
  AttributeDefinition,
  GlobalSecondaryIndexUpdate,
  KeySchemaElement,
  LocalSecondaryIndex,
  TableDescription,
} from '@aws-sdk/client-dynamodb';
import { Dynamode } from '@lib/dynamode';
import { AttributeType } from '@lib/dynamode/storage/types';
import Entity from '@lib/entity';
import { Metadata, TableCreateIndexOptions } from '@lib/table/types';
import { ConflictError, deepEqual, ValidationError } from '@lib/utils';

// TODO: clean this file, move to multiple files, and add tests
export function getKeySchema(
  partitionKey: string | number | symbol,
  sortKey?: string | number | symbol,
): KeySchemaElement[] {
  return [
    { AttributeName: String(partitionKey), KeyType: 'HASH' },
    ...(sortKey ? [{ AttributeName: String(sortKey), KeyType: 'RANGE' }] : []),
  ];
}

export function getTableAttributeDefinitions<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
  tableEntityName: string,
): AttributeDefinition[] {
  const attributes = Dynamode.storage.getEntityAttributes(tableEntityName);
  const { partitionKey, sortKey, indexes } = metadata;

  // TODO: Double check this (SS is string set but not number set)
  const DynamodeToDynamoTypeMap = new Map<AttributeType, 'S' | 'N' | 'B' | 'M' | 'L' | 'SS'>([
    [String, 'S'],
    [Number, 'N'],
    [Boolean, 'B'],
    [Object, 'M'],
    [Array, 'L'],
    [Set, 'SS'],
    [Map, 'M'],
  ]);

  const partitionKeyDefinition = {
    AttributeName: String(partitionKey),
    AttributeType: DynamodeToDynamoTypeMap.get(attributes[String(partitionKey)].type),
  };

  const sortKeyDefinition = sortKey && [
    {
      AttributeName: String(sortKey),
      AttributeType: DynamodeToDynamoTypeMap.get(attributes[String(sortKey)].type),
    },
  ];

  const indexesDefinitions =
    indexes &&
    Object.values(indexes).flatMap((index) => {
      const indexPartitionKeyDefinition = index.partitionKey && [
        {
          AttributeName: String(index.partitionKey),
          AttributeType: DynamodeToDynamoTypeMap.get(attributes[String(index.partitionKey)].type),
        },
      ];

      const indexSortKeyDefinition = index.sortKey && [
        {
          AttributeName: String(index.sortKey),
          AttributeType: DynamodeToDynamoTypeMap.get(attributes[String(index.sortKey)].type),
        },
      ];

      return [
        ...(indexPartitionKeyDefinition ? indexPartitionKeyDefinition : []),
        ...(indexSortKeyDefinition ? indexSortKeyDefinition : []),
      ];
    });

  return [
    partitionKeyDefinition,
    ...(sortKeyDefinition ? sortKeyDefinition : []),
    ...(indexesDefinitions ? indexesDefinitions : []),
  ];
}

export function getTableLocalSecondaryIndexes<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
): LocalSecondaryIndex[] {
  const { partitionKey, indexes } = metadata;

  return Object.entries(indexes || {})
    .filter(([, index]) => !index.partitionKey && index.sortKey)
    .map(([indexName, index]) => ({
      IndexName: indexName,
      KeySchema: [
        { AttributeName: String(partitionKey), KeyType: 'HASH' },
        { AttributeName: String(index.sortKey), KeyType: 'RANGE' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
    }));
}

export function getTableGlobalSecondaryIndexes<M extends Metadata<TE>, TE extends typeof Entity>(
  metadata: M,
): LocalSecondaryIndex[] {
  const { indexes } = metadata;

  return Object.entries(indexes || {})
    .filter(([, index]) => index.partitionKey)
    .map(([indexName, index]) => ({
      IndexName: indexName,
      KeySchema: [
        { AttributeName: String(index.partitionKey), KeyType: 'HASH' },
        ...(index.sortKey ? [{ AttributeName: String(index.sortKey), KeyType: 'RANGE' }] : []),
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
    }));
}

export function validateTableSynchronization<M extends Metadata<TE>, TE extends typeof Entity>({
  metadata,
  tableNameEntity,
  table,
}: {
  metadata: M;
  tableNameEntity: string;
  table?: TableDescription;
}) {
  const tableKeySchema = table?.KeySchema;
  const tableAttributeDefinitions = table?.AttributeDefinitions;
  const tableLocalSecondaryIndexes = table?.LocalSecondaryIndexes?.map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));
  const tableGlobalSecondaryIndexes = table?.GlobalSecondaryIndexes?.map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));

  const keySchema = getKeySchema(metadata.partitionKey, metadata.sortKey);
  const attributeDefinitions = getTableAttributeDefinitions(metadata, tableNameEntity);
  const localSecondaryIndexes = getTableLocalSecondaryIndexes(metadata).map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));
  const globalSecondaryIndexes = getTableGlobalSecondaryIndexes(metadata).map((v) => ({
    IndexName: v.IndexName,
    KeySchema: v.KeySchema,
  }));

  compareDynamodeEntityWithDynamoTable(keySchema, tableKeySchema || []);
  compareDynamodeEntityWithDynamoTable(attributeDefinitions, tableAttributeDefinitions || []);
  compareDynamodeEntityWithDynamoTable(localSecondaryIndexes, tableLocalSecondaryIndexes || []);
  compareDynamodeEntityWithDynamoTable(globalSecondaryIndexes, tableGlobalSecondaryIndexes || []);
}

export function compareDynamodeEntityWithDynamoTable<T>(aa: T[], bb: T[]) {
  aa.forEach((a) => {
    if (!bb?.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in table`);
    }
  });

  bb.forEach((a) => {
    if (!aa.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in entity`);
    }
  });

  if (aa.length !== bb.length) {
    throw new ConflictError('Key schema length mismatch between table and entity');
  }
}

// TODO: Implement conversion from TableDescription to TableInformation
export type TableInformation = TableDescription;

export function convertTableDescription(tableDescription?: TableDescription): TableInformation {
  if (!tableDescription) {
    throw new ValidationError('TableDescription is required');
  }

  return tableDescription;
}

export function buildIndexCreate({
  indexName,
  partitionKey,
  sortKey,
  options,
}: {
  indexName: string;
  partitionKey: string | number | symbol;
  sortKey: string | number | symbol | undefined;
  options?: TableCreateIndexOptions;
}): GlobalSecondaryIndexUpdate[] {
  const throughput = options?.throughput && {
    ReadCapacityUnits: options.throughput.read,
    WriteCapacityUnits: options.throughput.write,
  };

  return [
    {
      Create: {
        IndexName: indexName,
        KeySchema: getKeySchema(partitionKey, sortKey),
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: throughput,
      },
    },
  ];
}

export function buildIndexDelete(indexName: string): GlobalSecondaryIndexUpdate[] {
  return [
    {
      Delete: {
        IndexName: indexName,
      },
    },
  ];
}
