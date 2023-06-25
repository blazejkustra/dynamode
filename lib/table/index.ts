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
import { entityManager as EntityManager } from '@lib/entity/entityManager';
import {
  Metadata,
  TableCreateIndexOptions,
  TableCreateOptions,
  TableDeleteIndexOptions,
  TableValidateOptions,
} from '@lib/table/types';
import {
  buildIndexCreate,
  buildIndexDelete,
  convertTableDescription,
  getKeySchema,
  getTableAttributeDefinitions,
  getTableGlobalSecondaryIndexes,
  getTableLocalSecondaryIndexes,
  TableInformation,
  validateTableSynchronization,
} from '@lib/table/utils';
import { isNotEmptyArray, Narrow, ValidationError } from '@lib/utils';

export function tableManager<TE extends typeof Entity>(tableEntity: TE) {
  function metadata<M extends Metadata<TE>>(tableMetadata: Narrow<M>) {
    return new TableManager(tableMetadata as M, tableEntity);
  }

  return {
    metadata,
  };
}

class TableManager<M extends Metadata<TE>, TE extends typeof Entity> {
  public tableMetadata: M;
  public tableEntity: TE;

  constructor(tableMetadata: M, tableEntity: TE) {
    Dynamode.storage.registerTable(tableEntity, tableMetadata);
    Dynamode.storage.registerEntity(tableEntity, tableMetadata.tableName);
    Dynamode.storage.validateTableMetadata(tableEntity.name);

    this.tableMetadata = tableMetadata;
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

      return convertTableDescription(result.TableDescription);
    })();
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
      throw new ValidationError(`Index "${indexName}" not registered in ${this.tableEntity.name} entity`);
    }

    const { partitionKey, sortKey } = indexes?.[indexName];
    if (!partitionKey) {
      throw new ValidationError(`Index "${indexName}" doesn't have a partition key`);
    }

    const commandInput: UpdateTableCommandInput = {
      TableName: this.tableMetadata.tableName,
      AttributeDefinitions: getTableAttributeDefinitions(this.tableMetadata, this.tableEntity.name),
      GlobalSecondaryIndexUpdates: buildIndexCreate({ indexName, partitionKey, sortKey, options }),
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

      return convertTableDescription(result.TableDescription);
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
        `Before deleting index "${indexName}" make sure it is no longer registered in ${this.tableEntity.name} entity`,
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

      return convertTableDescription(result.TableDescription);
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

      validateTableSynchronization({
        metadata: this.tableMetadata,
        tableNameEntity: this.tableEntity.name,
        table: result.Table,
      });

      if (options?.return === 'output') {
        return result;
      }

      return convertTableDescription(result.Table);
    })();
  }
}
