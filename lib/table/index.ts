import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import { entityManager as EntityManager } from '@lib/entity/entityManager';
import { Metadata, TableCreateOptions } from '@lib/table/types';
import { DefaultError, Narrow } from '@lib/utils';

import {
  getKeySchema,
  getTableAttributeDefinitions,
  getTableGlobalSecondaryIndexes,
  getTableLocalSecondaryIndexes,
  validateTableEntityConsistency,
} from './utils';

class TableManager<M extends Metadata<TE>, TE extends typeof Entity> {
  public tableMetadata: M;
  public tableEntity: TE;

  constructor(tableMetadata: M, tableEntity: TE) {
    Dynamode.storage.registerTable(tableEntity, tableMetadata);
    Dynamode.storage.registerEntity(tableEntity, tableMetadata.tableName);

    this.tableMetadata = tableMetadata;
    this.tableEntity = tableEntity;
  }

  public entityManager<E extends TE>(entity?: E) {
    if (entity) {
      Dynamode.storage.registerEntity(entity, this.tableMetadata.tableName);
      return EntityManager<M, E>(entity, this.tableMetadata.tableName);
    }

    return EntityManager<M, TE>(this.tableEntity, this.tableMetadata.tableName);
  }

  public async create(
    { tags, throughput, deletionProtection = false }: TableCreateOptions = { deletionProtection: false },
  ) {
    const attributes = Dynamode.storage.getEntityAttributes(this.tableEntity.name);
    const keySchema = getKeySchema(this.tableMetadata);
    const attributeDefinitions = getTableAttributeDefinitions(this.tableMetadata, attributes);
    const localSecondaryIndexes = getTableLocalSecondaryIndexes(this.tableMetadata);
    const globalSecondaryIndexes = getTableGlobalSecondaryIndexes(this.tableMetadata);

    const { TableDescription: tableDescription } = await Dynamode.ddb.get().createTable({
      TableName: this.tableMetadata.tableName,
      KeySchema: keySchema,
      AttributeDefinitions: attributeDefinitions,

      LocalSecondaryIndexes: localSecondaryIndexes.length ? localSecondaryIndexes : undefined,
      GlobalSecondaryIndexes: globalSecondaryIndexes.length ? globalSecondaryIndexes : undefined,

      DeletionProtectionEnabled: deletionProtection,
      BillingMode: throughput ? 'PROVISIONED' : 'PAY_PER_REQUEST',
      ProvisionedThroughput: throughput && {
        ReadCapacityUnits: throughput.read,
        WriteCapacityUnits: throughput.write,
      },
      Tags: tags && Object.entries(tags).map(([key, value]) => ({ Key: key, Value: value })),
    });

    return tableDescription;
  }

  public async createIndex(indexName: string) {
    const { Table: table } = await Dynamode.ddb.get().describeTable({ TableName: this.tableMetadata.tableName });

    const read = table?.ProvisionedThroughput?.ReadCapacityUnits;
    const write = table?.ProvisionedThroughput?.WriteCapacityUnits;
    const throughput = read && write ? { ReadCapacityUnits: read, WriteCapacityUnits: write } : undefined;

    const { indexes } = this.tableMetadata;
    const newIndex = indexes?.[indexName];
    if (!newIndex || !newIndex.partitionKey) {
      throw new DefaultError(`Index "${indexName}" not registered in ${this.tableEntity.name} entity`);
    }

    const { partitionKey, sortKey } = newIndex;
    if (!partitionKey) {
      throw new DefaultError(`Index "${indexName}" doesn't have a partition key`);
    }

    const attributes = Dynamode.storage.getEntityAttributes(this.tableEntity.name);
    const attributeDefinitions = getTableAttributeDefinitions(this.tableMetadata, attributes);

    const { TableDescription: tableDescription } = await Dynamode.ddb.get().updateTable({
      TableName: this.tableMetadata.tableName,
      AttributeDefinitions: attributeDefinitions,

      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: indexName,
            KeySchema: [
              { AttributeName: String(partitionKey), KeyType: 'HASH' },
              ...(sortKey ? [{ AttributeName: String(sortKey), KeyType: 'RANGE' }] : []),
            ],
            Projection: {
              ProjectionType: 'ALL',
            },
            ProvisionedThroughput: throughput,
          },
        },
      ],
    });

    return tableDescription;
  }

  public async deleteIndex(indexName: string) {
    const { indexes } = this.tableMetadata;
    const oldIndex = indexes?.[indexName];
    if (oldIndex) {
      throw new DefaultError(
        `Before deleting index "${indexName}" make sure it is no longer registered in ${this.tableEntity.name} entity`,
      );
    }

    const { TableDescription: tableDescription } = await Dynamode.ddb.get().updateTable({
      TableName: this.tableMetadata.tableName,
      GlobalSecondaryIndexUpdates: [
        {
          Delete: {
            IndexName: indexName,
          },
        },
      ],
    });

    return tableDescription;
  }

  public async validate() {
    const { Table: table } = await Dynamode.ddb.get().describeTable({ TableName: this.tableMetadata.tableName });
    const attributes = Dynamode.storage.getEntityAttributes(this.tableEntity.name);

    const tableKeySchema = table?.KeySchema;
    const keySchema = getKeySchema(this.tableMetadata);
    validateTableEntityConsistency(keySchema, tableKeySchema || []);

    const tableAttributeDefinitions = table?.AttributeDefinitions;
    const attributeDefinitions = getTableAttributeDefinitions(this.tableMetadata, attributes);
    validateTableEntityConsistency(attributeDefinitions, tableAttributeDefinitions || []);

    const tableLocalSecondaryIndexes = table?.LocalSecondaryIndexes;
    const localSecondaryIndexes = getTableLocalSecondaryIndexes(this.tableMetadata);
    validateTableEntityConsistency(
      localSecondaryIndexes.map((v) => ({
        IndexName: v.IndexName,
        KeySchema: v.KeySchema,
      })),
      tableLocalSecondaryIndexes?.map((v) => ({
        IndexName: v.IndexName,
        KeySchema: v.KeySchema,
      })) || [],
    );

    const tableGlobalSecondaryIndexes = table?.GlobalSecondaryIndexes;
    const globalSecondaryIndexes = getTableGlobalSecondaryIndexes(this.tableMetadata);
    validateTableEntityConsistency(
      globalSecondaryIndexes.map((v) => ({
        IndexName: v.IndexName,
        KeySchema: v.KeySchema,
      })),
      tableGlobalSecondaryIndexes?.map((v) => ({
        IndexName: v.IndexName,
        KeySchema: v.KeySchema,
      })) || [],
    );

    return table;
  }
}

export function tableManager<TE extends typeof Entity>(tableEntity: TE) {
  function metadata<M extends Metadata<TE>>(tableMetadata: Narrow<M>) {
    return new TableManager(tableMetadata as M, tableEntity);
  }

  return {
    metadata,
  };
}
