import {
  CreateTableCommandInput,
  CreateTableCommandOutput,
  DeleteTableCommandInput,
  DeleteTableCommandOutput,
  DescribeTableCommandInput,
  DescribeTableCommandOutput,
  UpdateTableCommandInput,
  UpdateTableCommandOutput,
} from '@aws-sdk/client-dynamodb';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import EntityManager from '@lib/entity/entityManager';
import { buildIndexCreate, buildIndexDelete } from '@lib/table/helpers/builders';
import { convertToTableData } from '@lib/table/helpers/converters';
import { getTableAttributeDefinitions } from '@lib/table/helpers/definitions';
import { getKeySchema } from '@lib/table/helpers/schema';
import { validateTable } from '@lib/table/helpers/validator';
import {
  Metadata,
  TableCreateIndexOptions,
  TableCreateOptions,
  TableData,
  TableDeleteIndexOptions,
  TableDeleteOptions,
  TableIndexNames,
  TableValidateOptions,
} from '@lib/table/types';
import { isNotEmptyArray, Narrow, ValidationError } from '@lib/utils';

import { getTableGlobalSecondaryIndexes, getTableLocalSecondaryIndexes } from './helpers/indexes';

/**
 * Manages DynamoDB table operations and provides entity managers.
 *
 * The TableManager is responsible for creating, deleting, and managing DynamoDB tables,
 * as well as providing entity managers for performing CRUD operations on entities
 * within those tables.
 *
 * @example
 * ```typescript
 * class User extends Entity {
 *   @attribute.partitionKey.string()
 *   id: string;
 *
 *   @attribute.string()
 *   name: string;
 * }
 *
 * const UserTableManager = new TableManager(User, {
 *   tableName: 'users-table',
 *   partitionKey: 'id',
 *   indexes: {
 *     NameIndex: {
 *       partitionKey: 'name'
 *     }
 *   }
 * });
 *
 * // Create the table
 * await UserTableManager.createTable();
 *
 * // Get an entity manager
 * const UserManager = UserTableManager.entityManager();
 * ```
 *
 * @see {@link https://blazejkustra.github.io/dynamode/docs/guide/managers/tableManager} for more information
 */
export default class TableManager<M extends Metadata<TE>, TE extends typeof Entity> {
  /**
   * The table metadata configuration.
   *
   * @readonly
   */
  public tableMetadata: M;

  /**
   * The base entity class for this table.
   *
   * @readonly
   */
  public tableEntity: TE;

  /**
   * Creates a new TableManager instance.
   *
   * @param tableEntity - The base entity class for the table
   * @param tableMetadata - The table configuration metadata
   *
   * @example
   * ```typescript
   * const tableManager = new TableManager(User, {
   *   tableName: 'users-table',
   *   partitionKey: 'id',
   *   sortKey: 'createdAt',
   *   indexes: {
   *     StatusIndex: {
   *       partitionKey: 'status',
   *       sortKey: 'createdAt'
   *     }
   *   }
   * });
   * ```
   */
  constructor(tableEntity: TE, tableMetadata: Narrow<M>) {
    const metadata: M = tableMetadata as M;

    Dynamode.storage.registerTable(tableEntity, metadata);
    Dynamode.storage.registerEntity(tableEntity, metadata.tableName);
    Dynamode.storage.validateTableMetadata(tableEntity.name);

    this.tableMetadata = metadata;
    this.tableEntity = tableEntity;
  }

  /**
   * Creates an entity manager for the base table entity.
   *
   * @returns An EntityManager instance for the base table entity
   *
   * @example
   * ```typescript
   * const UserManager = UserTableManager.entityManager();
   * const user = await UserManager.get({ id: 'user-123' });
   * ```
   */
  public entityManager(): ReturnType<typeof EntityManager<M, TE>>;
  public entityManager<E extends TE>(
    entity?: E,
  ): ReturnType<typeof EntityManager<M, E>> | ReturnType<typeof EntityManager<M, TE>> {
    if (entity) {
      Dynamode.storage.registerEntity(entity, this.tableMetadata.tableName);
      return EntityManager<M, E>(entity, this.tableMetadata.tableName);
    }

    return EntityManager<M, TE>(this.tableEntity, this.tableMetadata.tableName);
  }

  public createTable(options?: TableCreateOptions & { return?: 'default' }): Promise<TableData>;
  public createTable(options: TableCreateOptions & { return: 'output' }): Promise<CreateTableCommandOutput>;
  public createTable(options: TableCreateOptions & { return: 'input' }): CreateTableCommandInput;
  public createTable(
    options?: TableCreateOptions,
  ): Promise<TableData | CreateTableCommandOutput> | CreateTableCommandInput {
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
      DeletionProtectionEnabled: options?.deletionProtection ?? false,
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

      return convertToTableData(result.TableDescription);
    })();
  }

  public deleteTable(tableName: string, options?: TableDeleteOptions & { return?: 'default' }): Promise<TableData>;

  public deleteTable(
    tableName: string,
    options: TableDeleteOptions & { return: 'output' },
  ): Promise<DeleteTableCommandOutput>;

  public deleteTable(tableName: string, options: TableDeleteOptions & { return: 'input' }): DeleteTableCommandInput;

  public deleteTable(
    tableName: string,
    options?: TableDeleteOptions,
  ): Promise<TableData | DeleteTableCommandOutput> | DeleteTableCommandInput {
    if (tableName !== this.tableMetadata.tableName) {
      throw new ValidationError(`To delete table "${this.tableMetadata.tableName}", pass the table name as argument`);
    }

    const commandInput: DeleteTableCommandInput = { TableName: this.tableMetadata.tableName, ...options?.extraInput };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().deleteTable(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return convertToTableData(result.TableDescription);
    })();
  }

  public createTableIndex(
    indexName: TableIndexNames<M, TE>,
    options?: TableCreateIndexOptions & { return?: 'default' },
  ): Promise<TableData>;

  public createTableIndex(
    indexName: TableIndexNames<M, TE>,
    options: TableCreateIndexOptions & { return: 'output' },
  ): Promise<UpdateTableCommandOutput>;

  public createTableIndex(
    indexName: TableIndexNames<M, TE>,
    options: TableCreateIndexOptions & { return: 'input' },
  ): UpdateTableCommandInput;

  public createTableIndex(
    indexName: TableIndexNames<M, TE>,
    options?: TableCreateIndexOptions,
  ): Promise<TableData | UpdateTableCommandOutput> | UpdateTableCommandInput {
    const { indexes } = this.tableMetadata;
    if (!indexes || !indexes?.[indexName as string]) {
      throw new ValidationError(`Index "${indexName}" not decorated in ${this.tableEntity.name} entity`);
    }

    const { partitionKey, sortKey } = indexes?.[indexName];
    if (!partitionKey) {
      throw new ValidationError(`Index "${indexName}" doesn't have a partition key`);
    }

    const throughput = options?.throughput && {
      ReadCapacityUnits: options.throughput.read,
      WriteCapacityUnits: options.throughput.write,
    };

    const commandInput: UpdateTableCommandInput = {
      TableName: this.tableMetadata.tableName,
      AttributeDefinitions: getTableAttributeDefinitions(this.tableMetadata, this.tableEntity.name),
      GlobalSecondaryIndexUpdates: buildIndexCreate({
        indexName,
        partitionKey,
        sortKey,
        throughput,
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

      return convertToTableData(result.TableDescription);
    })();
  }

  public deleteTableIndex(
    indexName: string,
    options?: TableDeleteIndexOptions & { return?: 'default' },
  ): Promise<TableData>;

  public deleteTableIndex(
    indexName: string,
    options: TableDeleteIndexOptions & { return: 'output' },
  ): Promise<UpdateTableCommandOutput>;

  public deleteTableIndex(
    indexName: string,
    options: TableDeleteIndexOptions & { return: 'input' },
  ): UpdateTableCommandInput;

  public deleteTableIndex(
    indexName: string,
    options?: TableDeleteIndexOptions,
  ): Promise<TableData | UpdateTableCommandOutput> | UpdateTableCommandInput {
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

      return convertToTableData(result.TableDescription);
    })();
  }

  /**
   * Validates that the existing DynamoDB table matches the table metadata configuration.
   *
   * @param options - Optional configuration for table validation
   * @returns A promise that resolves to table data
   * @throws {ValidationError} When the table structure doesn't match the metadata
   *
   * @example
   * ```typescript
   * // Validate the table structure
   * const tableData = await UserTableManager.validateTable();
   * ```
   */
  public validateTable(options?: TableValidateOptions & { return?: 'default' }): Promise<TableData>;

  /**
   * Validates the table, returning the raw AWS response.
   *
   * @param options - Configuration for table validation with return type 'output'
   * @returns A promise that resolves to the raw DescribeTableCommandOutput
   */
  public validateTable(options: TableValidateOptions & { return: 'output' }): Promise<DescribeTableCommandOutput>;

  /**
   * Builds the DescribeTable command input without executing it.
   *
   * @param options - Configuration for table validation with return type 'input'
   * @returns The DescribeTableCommandInput object
   */
  public validateTable(options: TableValidateOptions & { return: 'input' }): DescribeTableCommandInput;

  /**
   * Validates that the existing DynamoDB table matches the table metadata configuration.
   *
   * @param options - Optional configuration for table validation
   * @returns A promise that resolves to table data, raw AWS response, or command input
   */
  public validateTable(
    options?: TableValidateOptions,
  ): Promise<TableData | DescribeTableCommandOutput> | DescribeTableCommandInput {
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

      return convertToTableData(result.Table);
    })();
  }
}
