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
import { attribute, createdAt, gsiPartitionKey, gsiSortKey, lsiSortKey, prefix, primaryPartitionKey, primarySortKey, updatedAt } from '@lib/decorators';
import { Dynamode } from '@lib/dynamode';
import Query from '@lib/query';
import Scan from '@lib/scan';
import { GetTransaction } from '@lib/transactionGet/types';
import { WriteTransaction } from '@lib/transactionWrite/types';
import { AttributeValues, ExpressionBuilder, fromDynamo, NotFoundError } from '@lib/utils';

import {
  buildDeleteConditionExpression,
  buildGetProjectionExpression,
  buildPutConditionExpression,
  buildUpdateConditionExpression,
  convertAttributeValuesToEntity,
  convertEntityToAttributeValues,
  convertPrimaryKeyToAttributeValues,
  mapReturnValues,
  mapReturnValuesLimited,
} from './helpers';
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
  EntityMetadata,
  EntityPrimaryKey,
  EntityPutOptions,
  EntityTransactionDeleteOptions,
  EntityTransactionGetOptions,
  EntityTransactionPutOptions,
  EntityTransactionUpdateOptions,
  EntityUpdateOptions,
  UpdateProps,
} from './types';

export class Entity {
  public static tableName: string;
  public readonly dynamodeEntity: string;

  constructor(...args: any[]) {
    console.log(args);
  }
}

export function register<E extends typeof Entity, EM extends EntityMetadata>(entity: E, tableName: string) {
  function condition(): Condition<E> {
    return new Condition(entity);
  }

  function query(): Query<E, EM> {
    return new Query(entity);
  }

  function scan(): Scan<E, EM> {
    return new Scan(entity);
  }

  function get(primaryKey: EntityPrimaryKey<E, EM>): Promise<InstanceType<E>>;
  function get(primaryKey: EntityPrimaryKey<E, EM>, options: EntityGetOptions<E> & { return: 'default' }): Promise<InstanceType<E>>;
  function get(primaryKey: EntityPrimaryKey<E, EM>, options: EntityGetOptions<E> & { return: 'output' }): Promise<GetItemCommandOutput>;
  function get(primaryKey: EntityPrimaryKey<E, EM>, options: EntityGetOptions<E> & { return: 'input' }): GetItemCommandInput;
  function get(primaryKey: EntityPrimaryKey<E, EM>, options?: EntityGetOptions<E>): Promise<InstanceType<E> | GetItemCommandOutput> | GetItemCommandInput {
    const { projectionExpression, attributeNames } = buildGetProjectionExpression(entity, options?.attributes);

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

      if (!result.Item) {
        throw new NotFoundError();
      }

      if (options?.return === 'output') {
        return result;
      }

      return convertAttributeValuesToEntity(result.Item, entity);
    })();
  }

  function update(primaryKey: EntityPrimaryKey<E, EM>, props: UpdateProps<E>): Promise<InstanceType<E>>;
  function update(primaryKey: EntityPrimaryKey<E, EM>, props: UpdateProps<E>, options: EntityUpdateOptions<E> & { return: 'default' }): Promise<InstanceType<E>>;
  function update(primaryKey: EntityPrimaryKey<E, EM>, props: UpdateProps<E>, options: EntityUpdateOptions<E> & { return: 'output' }): Promise<UpdateItemCommandOutput>;
  function update(primaryKey: EntityPrimaryKey<E, EM>, props: UpdateProps<E>, options: EntityUpdateOptions<E> & { return: 'input' }): UpdateItemCommandInput;
  function update(primaryKey: EntityPrimaryKey<E, EM>, props: UpdateProps<E>, options?: EntityUpdateOptions<E>): Promise<InstanceType<E> | UpdateItemCommandOutput> | UpdateItemCommandInput {
    const { updateExpression, conditionExpression, attributeNames, attributeValues } = buildUpdateConditionExpression(props, options?.condition);

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

      return convertAttributeValuesToEntity(result.Attributes || {}, entity);
    })();
  }

  function put(item: InstanceType<E>): Promise<InstanceType<E>>;
  function put(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'default' }): Promise<InstanceType<E>>;
  function put(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'output' }): Promise<PutItemCommandOutput>;
  function put(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'input' }): PutItemCommandInput;
  function put(item: InstanceType<E>, options?: EntityPutOptions<E>): Promise<InstanceType<E> | PutItemCommandOutput> | PutItemCommandInput {
    const overwrite = options?.overwrite ?? true;
    const partitionKey = Dynamode.storage.getTableMetadata(tableName).partitionKey;
    const overwriteCondition = overwrite
      ? undefined
      : condition()
          .attribute(partitionKey as EntityKey<E>)
          .not()
          .exists();
    const dynamoItem = convertEntityToAttributeValues(entity, item);
    const { conditionExpression, attributeNames, attributeValues } = buildPutConditionExpression(overwriteCondition, options?.condition);

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

      return convertAttributeValuesToEntity(dynamoItem, entity);
    })();
  }

  function create(item: InstanceType<E>): Promise<InstanceType<E>>;
  function create(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'default' }): Promise<InstanceType<E>>;
  function create(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'output' }): Promise<PutItemCommandOutput>;
  function create(item: InstanceType<E>, options: EntityPutOptions<E> & { return: 'input' }): PutItemCommandInput;
  function create(item: InstanceType<E>, options?: EntityPutOptions<E>): Promise<InstanceType<E> | PutItemCommandOutput> | PutItemCommandInput {
    const overwrite = options?.overwrite ?? false;
    return put(item, { ...options, overwrite } as any);
  }

  function _delete(primaryKey: EntityPrimaryKey<E, EM>): Promise<InstanceType<E> | null>;
  function _delete(primaryKey: EntityPrimaryKey<E, EM>, options: EntityDeleteOptions<E> & { return: 'default' }): Promise<InstanceType<E> | null>;
  function _delete(primaryKey: EntityPrimaryKey<E, EM>, options: EntityDeleteOptions<E> & { return: 'output' }): Promise<DeleteItemCommandOutput>;
  function _delete(primaryKey: EntityPrimaryKey<E, EM>, options: EntityDeleteOptions<E> & { return: 'input' }): DeleteItemCommandInput;
  function _delete(primaryKey: EntityPrimaryKey<E, EM>, options?: EntityDeleteOptions<E>): Promise<InstanceType<E> | null | DeleteItemCommandOutput> | DeleteItemCommandInput {
    const throwErrorIfNotExists = options?.throwErrorIfNotExists ?? false;
    const partitionKey = Dynamode.storage.getTableMetadata(tableName).partitionKey as EntityKey<E>;
    const notExistsCondition = throwErrorIfNotExists ? condition().attribute(partitionKey).exists() : undefined;
    const { conditionExpression, attributeNames, attributeValues } = buildDeleteConditionExpression(notExistsCondition, options?.condition);

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

      return result.Attributes ? convertAttributeValuesToEntity(result.Attributes, entity) : null;
    })();
  }

  function batchGet(primaryKeys: Array<EntityPrimaryKey<E, EM>>): Promise<EntityBatchGetOutput<E, EM>>;
  function batchGet(primaryKeys: Array<EntityPrimaryKey<E, EM>>, options: EntityBatchGetOptions<E> & { return: 'default' }): Promise<EntityBatchGetOutput<E, EM>>;
  function batchGet(primaryKeys: Array<EntityPrimaryKey<E, EM>>, options: EntityBatchGetOptions<E> & { return: 'output' }): Promise<BatchGetItemCommandOutput>;
  function batchGet(primaryKeys: Array<EntityPrimaryKey<E, EM>>, options: EntityBatchGetOptions<E> & { return: 'input' }): BatchGetItemCommandInput;
  function batchGet(primaryKeys: Array<EntityPrimaryKey<E, EM>>, options?: EntityBatchGetOptions<E>): Promise<EntityBatchGetOutput<E, EM> | BatchGetItemCommandOutput> | BatchGetItemCommandInput {
    const { projectionExpression, attributeNames } = buildGetProjectionExpression(entity, options?.attributes);

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
      const result = await Dynamode.ddb.get().batchGetItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      const items = result.Responses?.[tableName] || [];
      const unprocessedKeys = result.UnprocessedKeys?.[tableName]?.Keys?.map((key) => fromDynamo(key) as EntityPrimaryKey<E, EM>) || [];

      return { items: items.map((item) => convertAttributeValuesToEntity(item, entity)), unprocessedKeys };
    })();
  }

  function batchPut(items: Array<InstanceType<E>>): Promise<EntityBatchPutOutput<E>>;
  function batchPut(items: Array<InstanceType<E>>, options: EntityBatchPutOptions & { return: 'default' }): Promise<EntityBatchPutOutput<E>>;
  function batchPut(items: Array<InstanceType<E>>, options: EntityBatchPutOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
  function batchPut(items: Array<InstanceType<E>>, options: EntityBatchPutOptions & { return: 'input' }): BatchWriteItemCommandInput;
  function batchPut(items: Array<InstanceType<E>>, options?: EntityBatchPutOptions): Promise<EntityBatchPutOutput<E> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
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
      const result = await Dynamode.ddb.get().batchWriteItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      const unprocessedItems =
        result.UnprocessedItems?.[tableName]
          ?.map((request) => request.PutRequest?.Item)
          ?.filter((item): item is AttributeValues => !!item)
          ?.map((item) => convertAttributeValuesToEntity(item, entity)) || [];

      return { items: dynamoItems.map((dynamoItem) => convertAttributeValuesToEntity(dynamoItem, entity)), unprocessedItems };
    })();
  }

  function batchDelete(primaryKeys: Array<EntityPrimaryKey<E, EM>>): Promise<EntityBatchDeleteOutput<EntityPrimaryKey<E, EM>>>;
  function batchDelete(primaryKeys: Array<EntityPrimaryKey<E, EM>>, options: EntityBatchDeleteOptions & { return: 'default' }): Promise<EntityBatchDeleteOutput<EntityPrimaryKey<E, EM>>>;
  function batchDelete(primaryKeys: Array<EntityPrimaryKey<E, EM>>, options: EntityBatchDeleteOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
  function batchDelete(primaryKeys: Array<EntityPrimaryKey<E, EM>>, options: EntityBatchDeleteOptions & { return: 'input' }): BatchWriteItemCommandInput;
  function batchDelete(primaryKeys: Array<EntityPrimaryKey<E, EM>>, options?: EntityBatchDeleteOptions): Promise<EntityBatchDeleteOutput<EntityPrimaryKey<E, EM>> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
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
      const result = await Dynamode.ddb.get().batchWriteItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      const unprocessedItems =
        result.UnprocessedItems?.[tableName]
          ?.map((request) => request.DeleteRequest?.Key)
          ?.filter((item): item is AttributeValues => !!item)
          .map((key) => fromDynamo(key) as EntityPrimaryKey<E, EM>) || [];

      return { unprocessedItems };
    })();
  }

  function transactionGet(primaryKey: EntityPrimaryKey<E, EM>, options?: EntityTransactionGetOptions<EntityKey<E>>): GetTransaction<E> {
    const { projectionExpression, attributeNames } = buildGetProjectionExpression(entity, options?.attributes);

    const commandInput: GetTransaction<E> = {
      ...entity,
      Get: {
        TableName: tableName,
        Key: convertPrimaryKeyToAttributeValues(entity, primaryKey),
        ProjectionExpression: projectionExpression,
        ExpressionAttributeNames: attributeNames,
        ...options?.extraInput,
      },
    };

    return commandInput;
  }

  function transactionUpdate(primaryKey: EntityPrimaryKey<E, EM>, props: UpdateProps<E>, options?: EntityTransactionUpdateOptions<E>): WriteTransaction<E> {
    const { updateExpression, conditionExpression, attributeNames, attributeValues } = buildUpdateConditionExpression(props, options?.condition);

    const commandInput: WriteTransaction<E> = {
      ...entity,
      Update: {
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

  function transactionPut(item: InstanceType<E>, options?: EntityTransactionPutOptions<E>): WriteTransaction<E> {
    const overwrite = options?.overwrite ?? true;
    const partitionKey = Dynamode.storage.getTableMetadata(tableName).partitionKey as EntityKey<E>;
    const overwriteCondition = overwrite ? undefined : condition().attribute(partitionKey).not().exists();
    const { conditionExpression, attributeNames, attributeValues } = buildPutConditionExpression(overwriteCondition, options?.condition);

    const commandInput: WriteTransaction<E> = {
      ...entity,
      Put: {
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

  function transactionCreate(item: InstanceType<E>, options?: EntityTransactionPutOptions<E>): WriteTransaction<E> {
    const overwrite = options?.overwrite ?? false;
    return transactionPut(item, { ...options, overwrite });
  }

  function transactionDelete(primaryKey: EntityPrimaryKey<E, EM>, options?: EntityTransactionDeleteOptions<E>): WriteTransaction<E> {
    const { conditionExpression, attributeNames, attributeValues } = buildDeleteConditionExpression(options?.condition);

    const commandInput: WriteTransaction<E> = {
      ...entity,
      Delete: {
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

  function transactionCondition(primaryKey: EntityPrimaryKey<E, EM>, conditionInstance: Condition<E>): WriteTransaction<E> {
    const expressionBuilder = new ExpressionBuilder();
    const conditionExpression = expressionBuilder.run(conditionInstance['operators']);

    const commandInput: WriteTransaction<E> = {
      ...entity,
      ConditionCheck: {
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

    transactionGet,
    transactionUpdate,
    transactionPut,
    transactionCreate,
    transactionDelete,
    transactionCondition,
  };
}

// user code

type TestTableKeys = {
  partitionKey: 'partitionKey';
  sortKey: 'sortKey';
  indexes: {
    GSI_1_NAME: {
      partitionKey: 'GSI_1_PK';
      sortKey: 'GSI_1_SK';
    };
    LSI_1_NAME: {
      sortKey: 'LSI_1_SK';
    };
  };
};

type TestTableProps = {
  partitionKey: string;
  sortKey: string;
  GSI_1_PK?: string;
  GSI_1_SK?: number;
  LSI_1_SK?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

const TEST_TABLE_NAME = 'test-table';
const PREFIX = 'prefix';

export class TestTable extends Entity {
  // Primary key
  @prefix(PREFIX)
  @primaryPartitionKey(String)
  partitionKey: string;

  @primarySortKey(String)
  sortKey: string;

  // Indexes
  @gsiPartitionKey(String, 'GSI_1_NAME')
  GSI_1_PK?: string;

  @gsiSortKey(Number, 'GSI_1_NAME')
  GSI_1_SK?: number;

  @lsiSortKey(Number, 'LSI_1_NAME')
  LSI_1_SK?: number;

  // Timestamps
  @createdAt(String)
  createdAt: Date;

  @updatedAt(Number)
  updatedAt: Date;

  constructor(props: TestTableProps) {
    super();

    // Primary key
    this.partitionKey = props.partitionKey;
    this.sortKey = props.sortKey;

    // Indexes
    this.GSI_1_PK = props.GSI_1_PK;
    this.GSI_1_SK = props.GSI_1_SK;
    this.LSI_1_SK = props.LSI_1_SK;

    // Timestamps
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}

export type MockEntityProps = TestTableProps & {
  string: string;
  object: {
    optional?: string;
    required: number;
  };
  array: string[];
  map: Map<string, string>;
  set: Set<string>;
  number?: number;
  boolean: boolean;
};

// @register(ddb)
export class MockEntity extends TestTable {
  @attribute(String)
  string: string;

  @attribute(Object)
  object: {
    optional?: string;
    required: number;
  };

  @attribute(Array)
  array?: string[];

  @attribute(Map)
  map: Map<string, string>;

  @attribute(Set)
  set: Set<string>;

  @attribute(Number)
  number?: number;

  @attribute(Boolean)
  boolean: boolean;

  unsaved: string;

  constructor(props: MockEntityProps) {
    super(props);

    this.string = props.string;
    this.object = props.object;
    this.array = props.array;
    this.map = props.map;
    this.set = props.set;
    this.number = props.number;
    this.boolean = props.boolean;
    this.unsaved = 'unsaved';
  }

  public method() {
    console.log('method');
  }

  public static staticMethod() {
    console.log('staticMethod');
  }
}

const mockEntity = register<typeof MockEntity, TestTableKeys>(MockEntity, TEST_TABLE_NAME);

const test2 = mockEntity.get({ partitionKey: '', sortKey: '' });
const test3 = mockEntity.update({ partitionKey: '', sortKey: '' }, { set: { 'array[2]': 'asdasds' } });
const test4 = mockEntity.put(
  new MockEntity({
    partitionKey: 'PK',
    sortKey: 'SK',
    string: 'string',
    object: {
      required: 2,
    },
    map: new Map([['1', '2']]),
    set: new Set(['1', '2', '3']),
    array: ['1', '2'],
    boolean: true,
  }),
);
