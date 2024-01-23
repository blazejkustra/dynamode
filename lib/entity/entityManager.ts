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

export default function EntityManager<M extends Metadata<E>, E extends typeof Entity>(entity: E, tableName: string) {
  function condition(): Condition<E> {
    return new Condition(entity);
  }

  function query(): Query<M, E> {
    return new Query<M, E>(entity);
  }

  function scan(): Scan<M, E> {
    return new Scan<M, E>(entity);
  }

  function get(
    primaryKey: TablePrimaryKey<M, E>,
    options?: EntityGetOptions<E> & { return?: 'default' },
  ): Promise<InstanceType<E>>;

  function get(
    primaryKey: TablePrimaryKey<M, E>,
    options: EntityGetOptions<E> & { return: 'output' },
  ): Promise<GetItemCommandOutput>;

  function get(
    primaryKey: TablePrimaryKey<M, E>,
    options: EntityGetOptions<E> & { return: 'input' },
  ): GetItemCommandInput;

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

  function update(
    primaryKey: TablePrimaryKey<M, E>,
    props: UpdateProps<E>,
    options?: EntityUpdateOptions<E> & { return?: 'default' },
  ): Promise<InstanceType<E>>;

  function update(
    primaryKey: TablePrimaryKey<M, E>,
    props: UpdateProps<E>,
    options: EntityUpdateOptions<E> & { return: 'output' },
  ): Promise<UpdateItemCommandOutput>;

  function update(
    primaryKey: TablePrimaryKey<M, E>,
    props: UpdateProps<E>,
    options: EntityUpdateOptions<E> & { return: 'input' },
  ): UpdateItemCommandInput;

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

  function put(item: InstanceType<E>, options?: EntityPutOptions<E> & { return?: 'default' }): Promise<InstanceType<E>>;

  function put(
    item: InstanceType<E>,
    options: EntityPutOptions<E> & { return: 'output' },
  ): Promise<PutItemCommandOutput>;
  function put(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'input' }): PutItemCommandInput;

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

  function create(
    item: InstanceType<E>,
    options?: EntityPutOptions<E> & { return?: 'default' },
  ): Promise<InstanceType<E>>;

  function create(
    item: InstanceType<E>,
    options: EntityPutOptions<E> & { return: 'output' },
  ): Promise<PutItemCommandOutput>;
  function create(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'input' }): PutItemCommandInput;

  function create(
    item: InstanceType<E>,
    options?: EntityPutOptions<E>,
  ): Promise<InstanceType<E> | PutItemCommandOutput> | PutItemCommandInput {
    const overwrite = options?.overwrite ?? false;
    return put(item, { ...options, overwrite } as any);
  }

  function _delete(
    primaryKey: TablePrimaryKey<M, E>,
    options?: EntityDeleteOptions<E> & { return?: 'default' },
  ): Promise<InstanceType<E> | null>;

  function _delete(
    primaryKey: TablePrimaryKey<M, E>,
    options: EntityDeleteOptions<E> & { return: 'output' },
  ): Promise<DeleteItemCommandOutput>;

  function _delete(
    primaryKey: TablePrimaryKey<M, E>,
    options: EntityDeleteOptions<E> & { return: 'input' },
  ): DeleteItemCommandInput;

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

  function batchGet(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options?: EntityBatchGetOptions<E> & { return?: 'default' },
  ): Promise<EntityBatchGetOutput<M, E>>;

  function batchGet(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options: EntityBatchGetOptions<E> & { return: 'output' },
  ): Promise<BatchGetItemCommandOutput>;

  function batchGet(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options: EntityBatchGetOptions<E> & { return: 'input' },
  ): BatchGetItemCommandInput;

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

  function batchPut(
    items: Array<InstanceType<E>>,
    options?: EntityBatchPutOptions & { return?: 'default' },
  ): Promise<EntityBatchPutOutput<E>>;

  function batchPut(
    items: Array<InstanceType<E>>,
    options: EntityBatchPutOptions & { return: 'output' },
  ): Promise<BatchWriteItemCommandOutput>;

  function batchPut(
    items: Array<InstanceType<E>>,
    options: EntityBatchPutOptions & { return: 'input' },
  ): BatchWriteItemCommandInput;

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

  function batchDelete(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options?: EntityBatchDeleteOptions & { return?: 'default' },
  ): Promise<EntityBatchDeleteOutput<TablePrimaryKey<M, E>>>;

  function batchDelete(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options: EntityBatchDeleteOptions & { return: 'output' },
  ): Promise<BatchWriteItemCommandOutput>;

  function batchDelete(
    primaryKeys: Array<TablePrimaryKey<M, E>>,
    options: EntityBatchDeleteOptions & { return: 'input' },
  ): BatchWriteItemCommandInput;

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

  function transactionCreate(item: InstanceType<E>, options?: EntityTransactionPutOptions<E>): TransactionPut<E> {
    const overwrite = options?.overwrite ?? false;
    return transactionPut(item, { ...options, overwrite });
  }

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
    query,
    scan,
    condition,

    get,
    update,
    put,
    create,
    delete: _delete,

    batchGet,
    batchPut,
    batchDelete,

    transaction: {
      get: transactionGet,
      update: transactionUpdate,
      put: transactionPut,
      create: transactionCreate,
      delete: transactionDelete,
      condition: transactionCondition,
    },
  };
}
