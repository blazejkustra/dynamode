import {
  CreateTableCommandInput,
  CreateTableCommandOutput,
  DescribeTableCommandInput,
  DescribeTableCommandOutput,
  UpdateTableCommandInput,
  UpdateTableCommandOutput,
} from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import EntityManager from '@lib/entity/entityManager';
import { buildIndexCreate, buildIndexDelete } from '@lib/table/helpers/builders';
import { convertToTableInformation } from '@lib/table/helpers/converters';
import { getTableAttributeDefinitions } from '@lib/table/helpers/definitions';
import { getKeySchema } from '@lib/table/helpers/schema';
import { validateTable } from '@lib/table/helpers/validator';
import {
  Metadata,
  TableCreateIndexOptions,
  TableCreateOptions,
  TableDeleteIndexOptions,
  TableInformation,
  TableValidateOptions,
} from '@lib/table/types';
import { isNotEmptyArray, Narrow, ValidationError } from '@lib/utils';

import { getTableGlobalSecondaryIndexes, getTableLocalSecondaryIndexes } from './helpers/indexes';

export default class TableManager<M extends Metadata<TE>, TE extends typeof Entity> {
  public tableMetadata: M;
  public tableEntity: TE;

  constructor(tableEntity: TE, tableMetadata: Narrow<M>) {
    const metadata: M = tableMetadata as M;

    Dynamode.storage.registerTable(tableEntity, metadata);
    Dynamode.storage.registerEntity(tableEntity, metadata.tableName);
    Dynamode.storage.validateTableMetadata(tableEntity.name);

    this.tableMetadata = metadata;
    this.tableEntity = tableEntity;
  }

  public entityManager(): ReturnType<typeof EntityManager<M, TE>>;
  public entityManager<E extends TE>(entity: E): ReturnType<typeof EntityManager<M, E>>;
  public entityManager<E extends TE>(
    entity?: E,
  ): ReturnType<typeof EntityManager<M, E>> | ReturnType<typeof EntityManager<M, TE>> {
    if (entity) {
      Dynamode.storage.registerEntity(entity, this.tableMetadata.tableName);
      return EntityManager<M, E>(entity, this.tableMetadata.tableName);
    }

    return EntityManager<M, TE>(this.tableEntity, this.tableMetadata.tableName);
  }

  public create(options?: TableCreateOptions & { return?: 'default' }): Promise<TableInformation>;
  public create(options: TableCreateOptions & { return: 'output' }): Promise<CreateTableCommandOutput>;
  public create(options: TableCreateOptions & { return: 'input' }): CreateTableCommandInput;
  public create(
    options?: TableCreateOptions,
  ): Promise<TableInformation | CreateTableCommandOutput> | CreateTableCommandInput {
    const localSecondaryIndexes = getTableLocalSecondaryIndexes(this.tableMetadata);
    const globalSecondaryIndexes = getTableGlobalSecondaryIndexes(this.tableMetadata);
    const throughput = options?.throughput && {
      ReadCapacityUnits: options?.throughput.read,
      WriteCapacityUnits: options?.throughput.write,
    };
    const tags = options?.tags && Object.entries(options.tags).map(([key, value]) => ({ Key: key, Value: value }));

    const commandInput: CreateTableCommandInput = {
      TableName: this.tableMetadata.tableName,
      KeySchema: getKeySchema(this.tableMetadata.partitionKey, this.tableMetadata.sortKey),
      AttributeDefinitions: getTableAttributeDefinitions(this.tableMetadata, this.tableEntity.name),
      LocalSecondaryIndexes: isNotEmptyArray(localSecondaryIndexes) ? localSecondaryIndexes : undefined,
      GlobalSecondaryIndexes: isNotEmptyArray(globalSecondaryIndexes) ? globalSecondaryIndexes : undefined,
      DeletionProtectionEnabled: options?.deletionProtection,
      BillingMode: throughput ? 'PROVISIONED' : 'PAY_PER_REQUEST',
      ProvisionedThroughput: throughput,
      Tags: tags,
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().createTable(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return convertToTableInformation(result.TableDescription);
    })();
  }

  public async delete(tableName: string) {
    if (tableName !== this.tableMetadata.tableName) {
      throw new ValidationError(`To delete table "${this.tableMetadata.tableName}", pass the table name as argument`);
    }

    return await Dynamode.ddb.get().deleteTable({ TableName: this.tableMetadata.tableName });
  }

  public createIndex(
    indexName: string,
    options?: TableCreateIndexOptions & { return?: 'default' },
  ): Promise<TableInformation>;

  public createIndex(
    indexName: string,
    options: TableCreateIndexOptions & { return: 'output' },
  ): Promise<UpdateTableCommandOutput>;

  public createIndex(
    indexName: string,
    options: TableCreateIndexOptions & { return: 'input' },
  ): UpdateTableCommandInput;

  public createIndex(
    indexName: string,
    options?: TableCreateIndexOptions,
  ): Promise<TableInformation | UpdateTableCommandOutput> | UpdateTableCommandInput {
    const { indexes } = this.tableMetadata;
    if (!indexes || !indexes?.[indexName]) {
      throw new ValidationError(`Index "${indexName}" not decorated in ${this.tableEntity.name} entity`);
    }

    const { partitionKey, sortKey } = indexes?.[indexName];
    if (!partitionKey) {
      throw new ValidationError(`Index "${indexName}" doesn't have a partition key`);
    }

    const commandInput: UpdateTableCommandInput = {
      TableName: this.tableMetadata.tableName,
      AttributeDefinitions: getTableAttributeDefinitions(this.tableMetadata, this.tableEntity.name),
      GlobalSecondaryIndexUpdates: buildIndexCreate({
        indexName,
        partitionKey,
        sortKey,
        options,
      }),
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().updateTable(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return convertToTableInformation(result.TableDescription);
    })();
  }

  public deleteIndex(
    indexName: string,
    options?: TableDeleteIndexOptions & { return?: 'default' },
  ): Promise<TableInformation>;

  public deleteIndex(
    indexName: string,
    options: TableDeleteIndexOptions & { return: 'output' },
  ): Promise<UpdateTableCommandOutput>;

  public deleteIndex(
    indexName: string,
    options: TableDeleteIndexOptions & { return: 'input' },
  ): UpdateTableCommandInput;

  public deleteIndex(
    indexName: string,
    options?: TableDeleteIndexOptions,
  ): Promise<TableInformation | UpdateTableCommandOutput> | UpdateTableCommandInput {
    const { indexes } = this.tableMetadata;
    if (indexes?.[indexName]) {
      throw new ValidationError(
        `Before deleting index "${indexName}" make sure it is no longer decorated in ${this.tableEntity.name} entity`,
      );
    }

    const commandInput: UpdateTableCommandInput = {
      TableName: this.tableMetadata.tableName,
      GlobalSecondaryIndexUpdates: buildIndexDelete(indexName),
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().updateTable(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return convertToTableInformation(result.TableDescription);
    })();
  }

  public validate(options?: TableValidateOptions & { return?: 'default' }): Promise<TableInformation>;
  public validate(options: TableValidateOptions & { return: 'output' }): Promise<DescribeTableCommandOutput>;
  public validate(options: TableValidateOptions & { return: 'input' }): DescribeTableCommandInput;
  public validate(
    options?: TableValidateOptions,
  ): Promise<TableInformation | DescribeTableCommandOutput> | DescribeTableCommandInput {
    const commandInput: DescribeTableCommandInput = { TableName: this.tableMetadata.tableName, ...options?.extraInput };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().describeTable(commandInput);

      validateTable({
        metadata: this.tableMetadata,
        tableNameEntity: this.tableEntity.name,
        table: result.Table,
      });

      if (options?.return === 'output') {
        return result;
      }

      return convertToTableInformation(result.Table);
    })();
  }
}
