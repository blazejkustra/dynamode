import {
  BatchGetItemCommandInput,
  BatchGetItemCommandOutput,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  GetItemCommandInput,
  GetItemCommandOutput,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import Dynamode from '@lib/dynamode/index';
import Entity from '@lib/entity';
import {
  buildDeleteConditionExpression,
  buildGetProjectionExpression,
  buildPutConditionExpression,
  buildUpdateConditionExpression,
} from '@lib/entity/helpers/buildExpressions';
import {
  convertAttributeValuesToEntity,
  convertEntityToAttributeValues,
  convertPrimaryKeyToAttributeValues,
} from '@lib/entity/helpers/converters';
import { mapReturnValues, mapReturnValuesLimited } from '@lib/entity/helpers/returnValues';
import {
  EntityBatchDeleteOptions,
  EntityBatchDeleteOutput,
  EntityBatchGetOptions,
  EntityBatchGetOutput,
  EntityBatchPutOptions,
  EntityBatchPutOutput,
  EntityDeleteOptions,
  EntityGetOptions,
  EntityKey,
  EntityPutOptions,
  EntityTransactionDeleteOptions,
  EntityTransactionGetOptions,
  EntityTransactionPutOptions,
  EntityTransactionUpdateOptions,
  EntityUpdateOptions,
  UpdateProps,
} from '@lib/entity/types';
import Query from '@lib/query';
import Scan from '@lib/scan';
import { Metadata, TablePrimaryKey } from '@lib/table/types';
import { TransactionGet } from '@lib/transactionGet/types';
import {
  TransactionCondition,
  TransactionDelete,
  TransactionPut,
  TransactionUpdate,
} from '@lib/transactionWrite/types';
import { AttributeValues, ExpressionBuilder, fromDynamo, NotFoundError } from '@lib/utils';

/**
 * Creates an EntityManager instance for a specific entity and table.
 *
 * The EntityManager provides a comprehensive set of methods for performing
 * CRUD operations, batch operations, and transactions on DynamoDB entities.
 * It handles the conversion between entity instances and DynamoDB attribute values,
 * manages conditions, and provides type-safe operations.
 *
 * @param entity - The entity class constructor
 * @param tableName - The name of the DynamoDB table
 * @returns An object containing all entity management methods
 *
 * @example
 * ```typescript
 * class User extends Entity {
 *   ＠attribute.partitionKey.string()
 *   id: string;
 *
 *   ＠attribute.string()
 *   name: string;
 * }
 *
 * const UserManager = EntityManager(User, 'users-table');
 *
 * // Create a new user
 * const user = await UserManager.put(new User({ id: '1', name: 'John' }));
 *
 * // Get a user
 * const retrievedUser = await UserManager.get({ id: '1' });
 *
 * // Update a user
 * const updatedUser = await UserManager.update({ id: '1' }, { set: { name: 'Jane' } });
 * ```
 *
 * @see {@link https://blazejkustra.github.io/dynamode/docs/guide/managers/entityManager} for more information
 */
export default function EntityManager<M extends Metadata<E>, E extends typeof Entity>(entity: E, tableName: string) {
  /**
   * Creates a new condition builder for this entity.
   *
   * @returns A new Condition instance for building conditional expressions
   *
   * @example
   * ```typescript
   * const condition = UserManager.condition()
   *   .attribute('name').eq('John')
   *   .and()
   *   .attribute('age').gt(18);
   *
   * await UserManager.update({ id: '1' }, { set: { status: 'active' } }, { condition });
   * ```
   */
  function condition(): Condition<E> {
    return new Condition(entity);
  }

  /**
   * Creates a new query builder for this entity.
   *
   * @returns A new Query instance for building query operations
   *
   * @example
   * ```typescript
   * const users = await UserManager.query()
   *   .partitionKey('id').eq('user-123')
   *   .sortKey('createdAt').gt(new Date('2023-01-01'))
   *   .run();
   * ```
   */
  function query(): Query<M, E> {
    return new Query<M, E>(entity);
  }

  /**
   * Creates a new scan builder for this entity.
   *
   * @returns A new Scan instance for building scan operations
   *
   * ⚠️ Keep in mind that scan operations are expensive, slow, and against [best practices](https://dynobase.dev/dynamodb-best-practices/).
   *
   * @example
   * ```typescript
   * const allUsers = await UserManager.scan()
   *   .attribute('status').eq('active')
   *   .run();
   * ```
   */
  function scan(): Scan<M, E> {
    return new Scan<M, E>(entity);
  }

  /**
   * Retrieves a single item from the table by its primary key.
   *
   * @param primaryKey - The primary key of the item to retrieve
   * @param options - Optional configuration for the get operation
   * @returns A promise that resolves to the entity instance
   * @throws {NotFoundError} When the item is not found
   *
   * @example
   * ```typescript
   * // Get a user by ID
   * const user = await UserManager.get({ id: 'user-123' });
   *
   * // Get with consistent read
   * const user = await UserManager.get({ id: 'user-123' }, { consistent: true });
   *
   * // Get only specific attributes
   * const user = await UserManager.get({ id: 'user-123' }, {
   *   attributes: ['id', 'name']
   * });
   * ```
   */
  function get(
    primaryKey: TablePrimaryKey<M, E>,
    options?: EntityGetOptions<E> & { return?: 'default' },
  ): Promise<InstanceType<E>>;

  /**
   * Retrieves a single item from the table by its primary key, returning the raw AWS response.
   *
   * @param primaryKey - The primary key of the item to retrieve
   * @param options - Configuration for the get operation with return type 'output'
   * @returns A promise that resolves to the raw GetItemCommandOutput
   */
  function get(
    primaryKey: TablePrimaryKey<M, E>,
    options: EntityGetOptions<E> & { return: 'output' },
  ): Promise<GetItemCommandOutput>;

  /**
   * Builds the GetItem command input without executing it.
   *
   * @param primaryKey - The primary key of the item to retrieve
   * @param options - Configuration for the get operation with return type 'input'
   * @returns The GetItemCommandInput object
   */
  function get(
    primaryKey: TablePrimaryKey<M, E>,
    options: EntityGetOptions<E> & { return: 'input' },
  ): GetItemCommandInput;

  /**
   * Retrieves a single item from the table by its primary key.
   *
   * @param primaryKey - The primary key of the item to retrieve
   * @param options - Optional configuration for the get operation
   * @returns A promise that resolves to the entity instance, raw AWS response, or command input
   * @throws {NotFoundError} When the item is not found and return type is 'default'
   */
  function get(
    primaryKey: TablePrimaryKey<M, E>,
    options?: EntityGetOptions<E>,
  ): Promise<InstanceType<E> | GetItemCommandOutput> | GetItemCommandInput {
    const { projectionExpression, attributeNames } = buildGetProjectionExpression(options?.attributes);

    const commandInput: GetItemCommandInput = {
      TableName: tableName,
      Key: convertPrimaryKeyToAttributeValues(entity, primaryKey),
      ConsistentRead: options?.consistent || false,
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: attributeNames,
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().getItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      if (!result.Item) {
        throw new NotFoundError();
      }

      return convertAttributeValuesToEntity(entity, result.Item);
    })();
  }

  /**
   * Updates an item in the table by its primary key.
   *
   * @param primaryKey - The primary key of the item to update
   * @param props - The update operations to perform
   * @param options - Optional configuration for the update operation
   * @returns A promise that resolves to the updated entity instance
   *
   * @example
   * ```typescript
   * // Update with SET operation
   * const updatedUser = await UserManager.update(
   *   { id: 'user-123' },
   *   { set: { name: 'Jane', age: 25 } }
   * );
   *
   * // Update with ADD operation (for numbers and sets)
   * const updatedUser = await UserManager.update(
   *   { id: 'user-123' },
   *   { add: { score: 10 } }
   * );
   *
   * // Update with conditional expression
   * const condition = UserManager.condition().attribute('version').eq(1);
   * const updatedUser = await UserManager.update(
   *   { id: 'user-123' },
   *   { set: { name: 'Jane' } },
   *   { condition }
   * );
   * ```
   */
  function update(
    primaryKey: TablePrimaryKey<M, E>,
    props: UpdateProps<E>,
    options?: EntityUpdateOptions<E> & { return?: 'default' },
  ): Promise<InstanceType<E>>;

  /**
   * Updates an item in the table, returning the raw AWS response.
   *
   * @param primaryKey - The primary key of the item to update
   * @param props - The update operations to perform
   * @param options - Configuration for the update operation with return type 'output'
   * @returns A promise that resolves to the raw UpdateItemCommandOutput
   */
  function update(
    primaryKey: TablePrimaryKey<M, E>,
    props: UpdateProps<E>,
    options: EntityUpdateOptions<E> & { return: 'output' },
  ): Promise<UpdateItemCommandOutput>;

  /**
   * Builds the UpdateItem command input without executing it.
   *
   * @param primaryKey - The primary key of the item to update
   * @param props - The update operations to perform
   * @param options - Configuration for the update operation with return type 'input'
   * @returns The UpdateItemCommandInput object
   */
  function update(
    primaryKey: TablePrimaryKey<M, E>,
    props: UpdateProps<E>,
    options: EntityUpdateOptions<E> & { return: 'input' },
  ): UpdateItemCommandInput;

  /**
   * Updates an item in the table by its primary key.
   *
   * @param primaryKey - The primary key of the item to update
   * @param props - The update operations to perform (set, add, remove, etc.)
   * @param options - Optional configuration for the update operation
   * @returns A promise that resolves to the updated entity instance, raw AWS response, or command input
   */
  function update(
    primaryKey: TablePrimaryKey<M, E>,
    props: UpdateProps<E>,
    options?: EntityUpdateOptions<E>,
  ): Promise<InstanceType<E> | UpdateItemCommandOutput> | UpdateItemCommandInput {
    const { updateExpression, conditionExpression, attributeNames, attributeValues } = buildUpdateConditionExpression(
      entity,
      props,
      options?.condition,
    );

    const commandInput: UpdateItemCommandInput = {
      TableName: tableName,
      Key: convertPrimaryKeyToAttributeValues(entity, primaryKey),
      ReturnValues: mapReturnValues(options?.returnValues),
      UpdateExpression: updateExpression,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().updateItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return convertAttributeValuesToEntity(entity, result.Attributes || {});
    })();
  }

  /**
   * Puts (creates or overwrites) an item in the table.
   *
   * @param item - The entity instance to put
   * @param options - Optional configuration for the put operation
   * @returns A promise that resolves to the entity instance
   *
   * @example
   * ```typescript
   * const user = new User({ id: 'user-123', name: 'John', age: 30 });
   * const savedUser = await UserManager.put(user);
   *
   * // Put with conditional expression
   * const condition = UserManager.condition().attribute('id').not().exists();
   * const savedUser = await UserManager.put(user, { condition });
   *
   * // Put without overwriting existing items
   * const savedUser = await UserManager.put(user, { overwrite: false });
   * ```
   */
  function put(item: InstanceType<E>, options?: EntityPutOptions<E> & { return?: 'default' }): Promise<InstanceType<E>>;

  /**
   * Puts an item in the table, returning the raw AWS response.
   *
   * @param item - The entity instance to put
   * @param options - Configuration for the put operation with return type 'output'
   * @returns A promise that resolves to the raw PutItemCommandOutput
   */
  function put(
    item: InstanceType<E>,
    options: EntityPutOptions<E> & { return: 'output' },
  ): Promise<PutItemCommandOutput>;

  /**
   * Builds the PutItem command input without executing it.
   *
   * @param item - The entity instance to put
   * @param options - Configuration for the put operation with return type 'input'
   * @returns The PutItemCommandInput object
   */
  function put(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'input' }): PutItemCommandInput;

  /**
   * Puts (creates or overwrites) an item in the table.
   *
   * @param item - The entity instance to put
   * @param options - Optional configuration for the put operation
   * @returns A promise that resolves to the entity instance, raw AWS response, or command input
   */
  function put(
    item: InstanceType<E>,
    options?: EntityPutOptions<E>,
  ): Promise<InstanceType<E> | PutItemCommandOutput> | PutItemCommandInput {
    const overwrite = options?.overwrite ?? true;
    const partitionKey = Dynamode.storage.getEntityMetadata(entity.name).partitionKey as EntityKey<E>;

    const overwriteCondition = overwrite ? undefined : condition().attribute(partitionKey).not().exists();
    const dynamoItem = convertEntityToAttributeValues(entity, item);
    const { conditionExpression, attributeNames, attributeValues } = buildPutConditionExpression(
      overwriteCondition,
      options?.condition,
    );

    const commandInput: PutItemCommandInput = {
      TableName: tableName,
      Item: dynamoItem,
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().putItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return convertAttributeValuesToEntity(entity, dynamoItem);
    })();
  }

  /**
   * Creates a new item in the table (fails if item already exists).
   *
   * This is equivalent to calling `put()` with `overwrite: false`.
   *
   * @param item - The entity instance to create
   * @param options - Optional configuration for the create operation
   * @returns A promise that resolves to the entity instance
   * @throws {ConditionalCheckFailedException} When the item already exists
   *
   * @example
   * ```typescript
   * const user = new User({ id: 'user-123', name: 'John', age: 30 });
   * const createdUser = await UserManager.create(user);
   *
   * // Create with conditional expression
   * const condition = UserManager.condition().attribute('status').eq('pending');
   * const createdUser = await UserManager.create(user, { condition });
   * ```
   */
  function create(
    item: InstanceType<E>,
    options?: EntityPutOptions<E> & { return?: 'default' },
  ): Promise<InstanceType<E>>;

  /**
   * Creates a new item in the table, returning the raw AWS response.
   *
   * @param item - The entity instance to create
   * @param options - Configuration for the create operation with return type 'output'
   * @returns A promise that resolves to the raw PutItemCommandOutput
   */
  function create(
    item: InstanceType<E>,
    options: EntityPutOptions<E> & { return: 'output' },
  ): Promise<PutItemCommandOutput>;

  /**
   * Builds the PutItem command input for creating an item without executing it.
   *
   * @param item - The entity instance to create
   * @param options - Configuration for the create operation with return type 'input'
   * @returns The PutItemCommandInput object
   */
  function create(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'input' }): PutItemCommandInput;

  /**
   * Creates a new item in the table (fails if item already exists).
   *
   * @param item - The entity instance to create
   * @param options - Optional configuration for the create operation
   * @returns A promise that resolves to the entity instance, raw AWS response, or command input
   */
  function create(
    item: InstanceType<E>,
    options?: EntityPutOptions<E>,
  ): Promise<InstanceType<E> | PutItemCommandOutput> | PutItemCommandInput {
    const overwrite = options?.overwrite ?? false;
    return put(item, { ...options, overwrite } as any);
  }

  /**
   * Deletes an item from the table by its primary key.
   *
   * @param primaryKey - The primary key of the item to delete
   * @param options - Optional configuration for the delete operation
   * @returns A promise that resolves to the deleted entity instance or null if not found
   *
   * @example
   * ```typescript
   * // Delete a user
   * const deletedUser = await UserManager.delete({ id: 'user-123' });
   *
   * // Delete with conditional expression
   * const condition = UserManager.condition().attribute('status').eq('inactive');
   * const deletedUser = await UserManager.delete({ id: 'user-123' }, { condition });
   *
   * // Delete and throw error if item doesn't exist
   * const deletedUser = await UserManager.delete(
   *   { id: 'user-123' },
   *   { throwErrorIfNotExists: true }
   * );
   * ```
   */
  function _delete(
    primaryKey: TablePrimaryKey<M, E>,
    options?: EntityDeleteOptions<E> & { return?: 'default' },
  ): Promise<InstanceType<E> | null>;

  /**
   * Deletes an item from the table, returning the raw AWS response.
   *
   * @param primaryKey - The primary key of the item to delete
   * @param options - Configuration for the delete operation with return type 'output'
   * @returns A promise that resolves to the raw DeleteItemCommandOutput
   */
  function _delete(
    primaryKey: TablePrimaryKey<M, E>,
    options: EntityDeleteOptions<E> & { return: 'output' },
  ): Promise<DeleteItemCommandOutput>;

  /**
   * Builds the DeleteItem command input without executing it.
   *
   * @param primaryKey - The primary key of the item to delete
   * @param options - Configuration for the delete operation with return type 'input'
   * @returns The DeleteItemCommandInput object
   */
  function _delete(
    primaryKey: TablePrimaryKey<M, E>,
    options: EntityDeleteOptions<E> & { return: 'input' },
  ): DeleteItemCommandInput;

  /**
   * Deletes an item from the table by its primary key.
   *
   * @param primaryKey - The primary key of the item to delete
   * @param options - Optional configuration for the delete operation
   * @returns A promise that resolves to the deleted entity instance, null, raw AWS response, or command input
   */
  function _delete(
    primaryKey: TablePrimaryKey<M, E>,
    options?: EntityDeleteOptions<E>,
  ): Promise<InstanceType<E> | null | DeleteItemCommandOutput> | DeleteItemCommandInput {
    const throwErrorIfNotExists = options?.throwErrorIfNotExists ?? false;
    const partitionKey = Dynamode.storage.getEntityMetadata(entity.name).partitionKey as EntityKey<E>;
    const notExistsCondition = throwErrorIfNotExists ? condition().attribute(partitionKey).exists() : undefined;
    const { conditionExpression, attributeNames, attributeValues } = buildDeleteConditionExpression(
      notExistsCondition,
      options?.condition,
    );

    const commandInput: DeleteItemCommandInput = {
      TableName: tableName,
      Key: convertPrimaryKeyToAttributeValues(entity, primaryKey),
      ReturnValues: mapReturnValuesLimited(options?.returnValues),
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: attributeNames,
      ExpressionAttributeValues: attributeValues,
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await Dynamode.ddb.get().deleteItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return result.Attributes ? convertAttributeValuesToEntity(entity, result.Attributes) : null;
    })();
  }

  /**
   * Retrieves multiple items from the table by their primary keys.
   *
   * @param primaryKeys - Array of primary keys to retrieve
   * @param options - Optional configuration for the batch get operation
   * @returns A promise that resolves to an object containing retrieved items and unprocessed keys
   *
   * @example
   * ```typescript
   * // Get multiple users
   * const result = await UserManager.batchGet([
   *   { id: 'user-1' },
   *   { id: 'user-2' },
   *   { id: 'user-3' }
   * ]);
   *
   * console.log(result.items); // Array of User instances
   * console.log(result.unprocessedKeys); // Keys that couldn't be processed
   *
   * // Get with consistent read
   * const result = await UserManager.batchGet(primaryKeys, { consistent: true });
   *
   * // Get only specific attributes
   * const result = await UserManager.batchGet(primaryKeys, {
   *   attributes: ['id', 'name']
   * });
   * ```
   */
  function batchGet(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options?: EntityBatchGetOptions<E> & { return?: 'default' },
  ): Promise<EntityBatchGetOutput<M, E>>;

  /**
   * Retrieves multiple items, returning the raw AWS response.
   *
   * @param primaryKeys - Array of primary keys to retrieve
   * @param options - Configuration for the batch get operation with return type 'output'
   * @returns A promise that resolves to the raw BatchGetItemCommandOutput
   */
  function batchGet(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options: EntityBatchGetOptions<E> & { return: 'output' },
  ): Promise<BatchGetItemCommandOutput>;

  /**
   * Builds the BatchGetItem command input without executing it.
   *
   * @param primaryKeys - Array of primary keys to retrieve
   * @param options - Configuration for the batch get operation with return type 'input'
   * @returns The BatchGetItemCommandInput object
   */
  function batchGet(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options: EntityBatchGetOptions<E> & { return: 'input' },
  ): BatchGetItemCommandInput;

  /**
   * Retrieves multiple items from the table by their primary keys.
   *
   * @param primaryKeys - Array of primary keys to retrieve
   * @param options - Optional configuration for the batch get operation
   * @returns A promise that resolves to the batch get result, raw AWS response, or command input
   */
  function batchGet(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options?: EntityBatchGetOptions<E>,
  ): Promise<EntityBatchGetOutput<M, E> | BatchGetItemCommandOutput> | BatchGetItemCommandInput {
    const { projectionExpression, attributeNames } = buildGetProjectionExpression(options?.attributes);

    const commandInput: BatchGetItemCommandInput = {
      RequestItems: {
        [tableName]: {
          Keys: primaryKeys.map((primaryKey) => convertPrimaryKeyToAttributeValues(entity, primaryKey)),
          ConsistentRead: options?.consistent || false,
          ProjectionExpression: projectionExpression,
          ExpressionAttributeNames: attributeNames,
        },
      },
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      if (primaryKeys.length === 0) {
        return {
          items: [],
          unprocessedKeys: [],
        };
      }

      const result = await Dynamode.ddb.get().batchGetItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      const items = result.Responses?.[tableName] || [];
      const unprocessedKeys =
        result.UnprocessedKeys?.[tableName]?.Keys?.map((key) => fromDynamo(key) as TablePrimaryKey<M, E>) || [];

      return {
        items: items.map((item) => convertAttributeValuesToEntity(entity, item)),
        unprocessedKeys,
      };
    })();
  }

  /**
   * Puts multiple items in the table in a single batch operation.
   *
   * @param items - Array of entity instances to put
   * @param options - Optional configuration for the batch put operation
   * @returns A promise that resolves to an object containing processed items and unprocessed items
   *
   * @example
   * ```typescript
   * const users = [
   *   new User({ id: 'user-1', name: 'John' }),
   *   new User({ id: 'user-2', name: 'Jane' }),
   *   new User({ id: 'user-3', name: 'Bob' })
   * ];
   *
   * const result = await UserManager.batchPut(users);
   * console.log(result.items); // Array of processed User instances
   * console.log(result.unprocessedItems); // Items that couldn't be processed
   * ```
   */
  function batchPut(
    items: Array<InstanceType<E>>,
    options?: EntityBatchPutOptions & { return?: 'default' },
  ): Promise<EntityBatchPutOutput<E>>;

  /**
   * Puts multiple items, returning the raw AWS response.
   *
   * @param items - Array of entity instances to put
   * @param options - Configuration for the batch put operation with return type 'output'
   * @returns A promise that resolves to the raw BatchWriteItemCommandOutput
   */
  function batchPut(
    items: Array<InstanceType<E>>,
    options: EntityBatchPutOptions & { return: 'output' },
  ): Promise<BatchWriteItemCommandOutput>;

  /**
   * Builds the BatchWriteItem command input for putting items without executing it.
   *
   * @param items - Array of entity instances to put
   * @param options - Configuration for the batch put operation with return type 'input'
   * @returns The BatchWriteItemCommandInput object
   */
  function batchPut(
    items: Array<InstanceType<E>>,
    options: EntityBatchPutOptions & { return: 'input' },
  ): BatchWriteItemCommandInput;

  /**
   * Puts multiple items in the table in a single batch operation.
   *
   * @param items - Array of entity instances to put
   * @param options - Optional configuration for the batch put operation
   * @returns A promise that resolves to the batch put result, raw AWS response, or command input
   */
  function batchPut(
    items: Array<InstanceType<E>>,
    options?: EntityBatchPutOptions,
  ): Promise<EntityBatchPutOutput<E> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
    const dynamoItems = items.map((item) => convertEntityToAttributeValues(entity, item));
    const commandInput: BatchWriteItemCommandInput = {
      RequestItems: {
        [tableName]: dynamoItems.map((dynamoItem) => ({
          PutRequest: {
            Item: dynamoItem,
          },
        })),
      },
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      if (items.length === 0) {
        return {
          items: [],
          unprocessedItems: [],
        };
      }

      const result = await Dynamode.ddb.get().batchWriteItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      const unprocessedItems =
        result.UnprocessedItems?.[tableName]
          ?.map((request) => request.PutRequest?.Item)
          ?.filter((item): item is AttributeValues => !!item)
          ?.map((item) => convertAttributeValuesToEntity(entity, item)) || [];

      return {
        items: dynamoItems.map((dynamoItem) => convertAttributeValuesToEntity(entity, dynamoItem)),
        unprocessedItems,
      };
    })();
  }

  /**
   * Deletes multiple items from the table by their primary keys in a single batch operation.
   *
   * @param primaryKeys - Array of primary keys to delete
   * @param options - Optional configuration for the batch delete operation
   * @returns A promise that resolves to an object containing unprocessed items
   *
   * @example
   * ```typescript
   * const primaryKeys = [
   *   { id: 'user-1' },
   *   { id: 'user-2' },
   *   { id: 'user-3' }
   * ];
   *
   * const result = await UserManager.batchDelete(primaryKeys);
   * console.log(result.unprocessedItems); // Keys that couldn't be processed
   * ```
   */
  function batchDelete(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options?: EntityBatchDeleteOptions & { return?: 'default' },
  ): Promise<EntityBatchDeleteOutput<TablePrimaryKey<M, E>>>;

  /**
   * Deletes multiple items, returning the raw AWS response.
   *
   * @param primaryKeys - Array of primary keys to delete
   * @param options - Configuration for the batch delete operation with return type 'output'
   * @returns A promise that resolves to the raw BatchWriteItemCommandOutput
   */
  function batchDelete(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options: EntityBatchDeleteOptions & { return: 'output' },
  ): Promise<BatchWriteItemCommandOutput>;

  /**
   * Builds the BatchWriteItem command input for deleting items without executing it.
   *
   * @param primaryKeys - Array of primary keys to delete
   * @param options - Configuration for the batch delete operation with return type 'input'
   * @returns The BatchWriteItemCommandInput object
   */
  function batchDelete(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options: EntityBatchDeleteOptions & { return: 'input' },
  ): BatchWriteItemCommandInput;

  /**
   * Deletes multiple items from the table by their primary keys in a single batch operation.
   *
   * @param primaryKeys - Array of primary keys to delete
   * @param options - Optional configuration for the batch delete operation
   * @returns A promise that resolves to the batch delete result, raw AWS response, or command input
   */
  function batchDelete(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options?: EntityBatchDeleteOptions,
  ):
    | Promise<EntityBatchDeleteOutput<TablePrimaryKey<M, E>> | BatchWriteItemCommandOutput>
    | BatchWriteItemCommandInput {
    const commandInput: BatchWriteItemCommandInput = {
      RequestItems: {
        [tableName]: primaryKeys.map((primaryKey) => ({
          DeleteRequest: {
            Key: convertPrimaryKeyToAttributeValues(entity, primaryKey),
          },
        })),
      },
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      if (primaryKeys.length === 0) {
        return {
          unprocessedItems: [],
        };
      }

      const result = await Dynamode.ddb.get().batchWriteItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      const unprocessedItems =
        result.UnprocessedItems?.[tableName]
          ?.map((request) => request.DeleteRequest?.Key)
          ?.filter((item): item is AttributeValues => !!item)
          .map((key) => fromDynamo(key) as TablePrimaryKey<M, E>) || [];

      return { unprocessedItems };
    })();
  }

  /**
   * Creates a transaction get operation for retrieving an item.
   *
   * This method creates a transaction get operation that can be used with
   * Dynamode's transaction system. The operation is not executed immediately
   * but must be passed to a transaction manager.
   *
   * @param primaryKey - The primary key of the item to retrieve
   * @param options - Optional configuration for the transaction get operation
   * @returns A TransactionGet object that can be used in a transaction
   *
   * @example
   * ```typescript
   * const getOperation = UserManager.transactionGet({ id: 'user-123' });
   *
   * // Use in a transaction
   * const result = await Dynamode.transaction.write([
   *   getOperation,
   *   UserManager.transaction.put(newUser),
   *   UserManager.transaction.delete({ id: 'old-user' })
   * ]);
   * ```
   *
   * You can read more about transactions [here](https://blazejkustra.github.io/dynamode/docs/guide/transactions).
   */
  function transactionGet(
    primaryKey: TablePrimaryKey<M, E>,
    options?: EntityTransactionGetOptions<EntityKey<E>>,
  ): TransactionGet<E> {
    const { projectionExpression, attributeNames } = buildGetProjectionExpression(options?.attributes);

    const commandInput: TransactionGet<E> = {
      entity,
      get: {
        TableName: tableName,
        Key: convertPrimaryKeyToAttributeValues(entity, primaryKey),
        ProjectionExpression: projectionExpression,
        ExpressionAttributeNames: attributeNames,
        ...options?.extraInput,
      },
    };

    return commandInput;
  }

  /**
   * Creates a transaction update operation for updating an item.
   *
   * @param primaryKey - The primary key of the item to update
   * @param props - The update operations to perform
   * @param options - Optional configuration for the transaction update operation
   * @returns A TransactionUpdate object that can be used in a transaction
   *
   * @example
   * ```typescript
   * const updateOperation = UserManager.transactionUpdate(
   *   { id: 'user-123' },
   *   { set: { name: 'Jane', status: 'active' } }
   * );
   * ```
   *
   * You can read more about transactions [here](https://blazejkustra.github.io/dynamode/docs/guide/transactions).
   */
  function transactionUpdate(
    primaryKey: TablePrimaryKey<M, E>,
    props: UpdateProps<E>,
    options?: EntityTransactionUpdateOptions<E>,
  ): TransactionUpdate<E> {
    const { updateExpression, conditionExpression, attributeNames, attributeValues } = buildUpdateConditionExpression(
      entity,
      props,
      options?.condition,
    );

    const commandInput: TransactionUpdate<E> = {
      entity,
      update: {
        TableName: tableName,
        Key: convertPrimaryKeyToAttributeValues(entity, primaryKey),
        ReturnValuesOnConditionCheckFailure: mapReturnValuesLimited(options?.returnValuesOnFailure),
        UpdateExpression: updateExpression,
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ...options?.extraInput,
      },
    };

    return commandInput;
  }

  /**
   * Creates a transaction put operation for putting an item.
   *
   * @param item - The entity instance to put
   * @param options - Optional configuration for the transaction put operation
   * @returns A TransactionPut object that can be used in a transaction
   *
   * @example
   * ```typescript
   * const putOperation = UserManager.transactionPut(new User({ id: 'user-123', name: 'John' }));
   * ```
   *
   * You can read more about transactions [here](https://blazejkustra.github.io/dynamode/docs/guide/transactions).
   */
  function transactionPut(item: InstanceType<E>, options?: EntityTransactionPutOptions<E>): TransactionPut<E> {
    const overwrite = options?.overwrite ?? true;
    const partitionKey = Dynamode.storage.getEntityMetadata(entity.name).partitionKey as EntityKey<E>;
    const overwriteCondition = overwrite ? undefined : condition().attribute(partitionKey).not().exists();
    const { conditionExpression, attributeNames, attributeValues } = buildPutConditionExpression(
      overwriteCondition,
      options?.condition,
    );

    const commandInput: TransactionPut<E> = {
      entity,
      put: {
        TableName: tableName,
        Item: convertEntityToAttributeValues(entity, item),
        ReturnValuesOnConditionCheckFailure: mapReturnValuesLimited(options?.returnValuesOnFailure),
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ...options?.extraInput,
      },
    };

    return commandInput;
  }

  /**
   * Creates a transaction create operation for creating an item (fails if item already exists).
   *
   * This is equivalent to calling `transactionPut()` with `overwrite: false`.
   *
   * @param item - The entity instance to create
   * @param options - Optional configuration for the transaction create operation
   * @returns A TransactionPut object that can be used in a transaction
   *
   * @example
   * ```typescript
   * const createOperation = UserManager.transactionCreate(new User({ id: 'user-123', name: 'John' }));
   * ```
   *
   * You can read more about transactions [here](https://blazejkustra.github.io/dynamode/docs/guide/transactions).
   */
  function transactionCreate(item: InstanceType<E>, options?: EntityTransactionPutOptions<E>): TransactionPut<E> {
    const overwrite = options?.overwrite ?? false;
    return transactionPut(item, { ...options, overwrite });
  }

  /**
   * Creates a transaction delete operation for deleting an item.
   *
   * @param primaryKey - The primary key of the item to delete
   * @param options - Optional configuration for the transaction delete operation
   * @returns A TransactionDelete object that can be used in a transaction
   *
   * @example
   * ```typescript
   * const deleteOperation = UserManager.transactionDelete({ id: 'user-123' });
   * ```
   *
   * You can read more about transactions [here](https://blazejkustra.github.io/dynamode/docs/guide/transactions).
   */
  function transactionDelete(
    primaryKey: TablePrimaryKey<M, E>,
    options?: EntityTransactionDeleteOptions<E>,
  ): TransactionDelete<E> {
    const { conditionExpression, attributeNames, attributeValues } = buildDeleteConditionExpression(options?.condition);

    const commandInput: TransactionDelete<E> = {
      entity,
      delete: {
        TableName: tableName,
        Key: convertPrimaryKeyToAttributeValues(entity, primaryKey),
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: attributeValues,
        ...options?.extraInput,
      },
    };

    return commandInput;
  }

  /**
   * Creates a transaction condition check operation.
   *
   * @param primaryKey - The primary key of the item to check
   * @param conditionInstance - The condition to check
   * @returns A TransactionCondition object that can be used in a transaction
   *
   * @example
   * ```typescript
   * const condition = UserManager.condition().attribute('status').eq('active');
   * const conditionCheck = UserManager.transactionCondition({ id: 'user-123' }, condition);
   * ```
   *
   * You can read more about transactions [here](https://blazejkustra.github.io/dynamode/docs/guide/transactions).
   */
  function transactionCondition(
    primaryKey: TablePrimaryKey<M, E>,
    conditionInstance: Condition<E>,
  ): TransactionCondition<E> {
    const expressionBuilder = new ExpressionBuilder();
    const conditionExpression = expressionBuilder.run(conditionInstance['operators']);

    const commandInput: TransactionCondition<E> = {
      entity,
      condition: {
        TableName: tableName,
        Key: convertPrimaryKeyToAttributeValues(entity, primaryKey),
        ConditionExpression: conditionExpression,
        ExpressionAttributeNames: expressionBuilder.attributeNames,
        ExpressionAttributeValues: expressionBuilder.attributeValues,
      },
    };

    return commandInput;
  }

  return {
    /** Query builder for this entity */
    query,
    /** Scan builder for this entity */
    scan,
    /** Condition builder for this entity */
    condition,

    /** Get a single item by primary key */
    get,
    /** Update an item by primary key */
    update,
    /** Put (create or overwrite) an item */
    put,
    /** Create a new item (fails if exists) */
    create,
    /** Delete an item by primary key */
    delete: _delete,

    /** Get multiple items by primary keys */
    batchGet,
    /** Put multiple items */
    batchPut,
    /** Delete multiple items by primary keys */
    batchDelete,

    /** Transaction operations */
    transaction: {
      /** Create a transaction get operation */
      get: transactionGet,
      /** Create a transaction update operation */
      update: transactionUpdate,
      /** Create a transaction put operation */
      put: transactionPut,
      /** Create a transaction create operation */
      create: transactionCreate,
      /** Create a transaction delete operation */
      delete: transactionDelete,
      /** Create a transaction condition check operation */
      condition: transactionCondition,
    },
  };
}
