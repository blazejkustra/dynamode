import {
  BatchGetItemCommandInput,
  BatchGetItemCommandOutput,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
  DeleteItemCommandInput,
  DeleteItemCommandOutput,
  DynamoDB,
  GetItemCommandInput,
  GetItemCommandOutput,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { Condition, ConditionInstance } from '@lib/Condition';
import { Query } from '@lib/Query';
import { Table } from '@lib/Table';
import {
  AttributeMap,
  buildExpression,
  classToObject,
  ConditionExpression,
  createdAt,
  fromDynamo,
  GenericObject,
  gsi1PartitionKey,
  gsi1SortKey,
  gsi2PartitionKey,
  gsi2SortKey,
  gsi3PartitionKey,
  gsi3SortKey,
  gsi4PartitionKey,
  gsi4SortKey,
  gsi5PartitionKey,
  gsi5SortKey,
  gsi6PartitionKey,
  gsi6SortKey,
  gsi7PartitionKey,
  gsi7SortKey,
  gsi8PartitionKey,
  gsi8SortKey,
  gsi9PartitionKey,
  gsi9SortKey,
  gsi10PartitionKey,
  gsi10SortKey,
  isEmpty,
  isEmptyWithoutSymbols,
  lsi1SortKey,
  lsi2SortKey,
  lsi3SortKey,
  lsi4SortKey,
  lsi5SortKey,
  NotFoundError,
  objectToDynamo,
  partitionKey,
  PartitionKeys,
  sortKey,
  substituteAttributeName,
  updatedAt,
} from '@lib/utils';
import {
  BuildDeleteConditionExpression,
  BuildGetProjectionExpression,
  BuildPutConditionExpression,
  BuildUpdateConditionExpression,
  ModelBatchDeleteOptions,
  ModelBatchDeleteOutput,
  ModelBatchGetOptions,
  ModelBatchGetOutput,
  ModelBatchPutOptions,
  ModelBatchPutOutput,
  ModelCreateOptions,
  ModelDeleteOptions,
  ModelGetOptions,
  ModelKeys,
  ModelProps,
  ModelPutOptions,
  ModelUpdateOptions,
  PrimaryKey,
  UpdateProps,
} from '@Model/types';
import { addPrefixSuffix, getTimestampValue, truncatePrefixSuffix } from '@Model/utils';

export class Model {
  private static _ddb: DynamoDB;

  public static prefixPk: string;
  public static prefixSk: string;
  public static suffixPk: string;
  public static suffixSk: string;
  public static table: typeof Table;

  [createdAt]?: Date;
  [updatedAt]?: Date;

  [partitionKey]: string | number;
  [sortKey]?: string | number;

  [gsi1PartitionKey]?: string | number;
  [gsi1SortKey]?: string | number;

  [gsi2PartitionKey]?: string | number;
  [gsi2SortKey]?: string | number;

  [gsi3PartitionKey]?: string | number;
  [gsi3SortKey]?: string | number;

  [gsi4PartitionKey]?: string | number;
  [gsi4SortKey]?: string | number;

  [gsi5PartitionKey]?: string | number;
  [gsi5SortKey]?: string | number;

  [gsi6PartitionKey]?: string | number;
  [gsi6SortKey]?: string | number;

  [gsi7PartitionKey]?: string | number;
  [gsi7SortKey]?: string | number;

  [gsi8PartitionKey]?: string | number;
  [gsi8SortKey]?: string | number;

  [gsi9PartitionKey]?: string | number;
  [gsi9SortKey]?: string | number;

  [gsi10PartitionKey]?: string | number;
  [gsi10SortKey]?: string | number;

  [lsi1SortKey]?: string | number;
  [lsi2SortKey]?: string | number;
  [lsi3SortKey]?: string | number;
  [lsi4SortKey]?: string | number;
  [lsi5SortKey]?: string | number;

  constructor(props: ModelProps<typeof Table>) {
    this[createdAt] = props[createdAt] || new Date();
    this[updatedAt] = props[updatedAt] || new Date();

    this[partitionKey] = props[partitionKey];
    this[sortKey] = props[sortKey];
  }

  public static query<M extends typeof Model>(this: M, key: PartitionKeys, value: string | number): InstanceType<typeof Query<M>> {
    return new Query(this, key, value);
  }

  public static condition<M extends typeof Model>(this: M, key: string): InstanceType<typeof Condition<M>> {
    return new Condition(this, key);
  }

  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>): Promise<InstanceType<M>>;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options: Omit<ModelGetOptions<M>, 'return'>): Promise<InstanceType<M>>;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options: ModelGetOptions<M> & { return: 'default' }): Promise<InstanceType<M>>;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options: ModelGetOptions<M> & { return: 'output' }): Promise<GetItemCommandOutput>;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options: ModelGetOptions<M> & { return: 'input' }): GetItemCommandInput;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options?: ModelGetOptions<M>): Promise<InstanceType<M> | GetItemCommandOutput> | GetItemCommandInput {
    const commandInput: GetItemCommandInput = {
      TableName: this.table.tableName,
      Key: this.convertPrimaryKeyToDynamo(primaryKey),
      ConsistentRead: options?.consistent || false,
      ...this.buildGetProjectionExpression(options?.attributes),
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await this._ddb.getItem(commandInput);

      if (!result || !result.Item) {
        throw new NotFoundError();
      }

      if (options?.return === 'output') {
        return result;
      }

      return this.parseFromDynamo(result.Item || {});
    })();
  }

  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, props: UpdateProps<InstanceType<M>>): Promise<InstanceType<M>>;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, props: UpdateProps<InstanceType<M>>, options: Omit<ModelUpdateOptions<M>, 'return'>): Promise<InstanceType<M>>;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, props: UpdateProps<InstanceType<M>>, options: ModelUpdateOptions<M> & { return: 'default' }): Promise<InstanceType<M>>;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, props: UpdateProps<InstanceType<M>>, options: ModelUpdateOptions<M> & { return: 'output' }): Promise<UpdateItemCommandOutput>;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, props: UpdateProps<InstanceType<M>>, options: ModelUpdateOptions<M> & { return: 'input' }): UpdateItemCommandInput;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, props: UpdateProps<InstanceType<M>>, options?: ModelUpdateOptions<M>): Promise<InstanceType<M> | UpdateItemCommandOutput> | UpdateItemCommandInput {
    const commandInput: UpdateItemCommandInput = {
      TableName: this.table.tableName,
      Key: this.convertPrimaryKeyToDynamo(primaryKey),
      ReturnValues: 'ALL_NEW',
      ...this.buildUpdateConditionExpression(props),
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await this._ddb.updateItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return this.parseFromDynamo(result.Attributes || {});
    })();
  }

  public static put<M extends typeof Model>(this: M, item: InstanceType<M>): Promise<InstanceType<M>>;
  public static put<M extends typeof Model>(this: M, item: InstanceType<M>, options: Omit<ModelPutOptions<M>, 'return'>): Promise<InstanceType<M>>;
  public static put<M extends typeof Model>(this: M, item: InstanceType<M>, options: ModelPutOptions<M> & { return: 'default' }): Promise<InstanceType<M>>;
  public static put<M extends typeof Model>(this: M, item: InstanceType<M>, options: ModelPutOptions<M> & { return: 'output' }): Promise<PutItemCommandOutput>;
  public static put<M extends typeof Model>(this: M, item: InstanceType<M>, options: ModelPutOptions<M> & { return: 'input' }): PutItemCommandInput;
  public static put<M extends typeof Model>(this: M, item: InstanceType<M>, options?: ModelPutOptions<M>): Promise<InstanceType<M> | PutItemCommandOutput> | PutItemCommandInput {
    const overwrite = options?.overwrite ?? true;
    const overwriteCondition = overwrite ? undefined : this.condition(this.table[partitionKey]).not().exists();

    const commandInput: PutItemCommandInput = {
      TableName: this.table.tableName,
      Item: this.modelToDynamo(item),
      ...this.buildPutConditionExpression(overwriteCondition, options?.condition),
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await this._ddb.putItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return item;
    })();
  }

  public static create<M extends typeof Model>(this: M, item: InstanceType<M>): Promise<InstanceType<M>>;
  public static create<M extends typeof Model>(this: M, item: InstanceType<M>, options: Omit<ModelCreateOptions<M>, 'return'>): Promise<InstanceType<M>>;
  public static create<M extends typeof Model>(this: M, item: InstanceType<M>, options: ModelCreateOptions<M> & { return: 'default' }): Promise<InstanceType<M>>;
  public static create<M extends typeof Model>(this: M, item: InstanceType<M>, options: ModelCreateOptions<M> & { return: 'output' }): Promise<PutItemCommandOutput>;
  public static create<M extends typeof Model>(this: M, item: InstanceType<M>, options: ModelCreateOptions<M> & { return: 'input' }): PutItemCommandInput;
  public static create<M extends typeof Model>(this: M, item: InstanceType<M>, options?: ModelCreateOptions<M>): Promise<InstanceType<M> | PutItemCommandOutput> | PutItemCommandInput {
    return this.put(item, { ...options, overwrite: false });
  }

  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>): Promise<void>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options: Omit<ModelDeleteOptions<M>, 'return'>): Promise<void>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options: ModelDeleteOptions<M> & { return: 'default' }): Promise<void>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options: ModelDeleteOptions<M> & { return: 'output' }): Promise<DeleteItemCommandOutput>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options: ModelDeleteOptions<M> & { return: 'input' }): DeleteItemCommandInput;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>, options?: ModelDeleteOptions<M>): Promise<void | DeleteItemCommandOutput> | DeleteItemCommandInput {
    const commandInput: DeleteItemCommandInput = {
      TableName: this.table.tableName,
      Key: this.convertPrimaryKeyToDynamo(primaryKey),
      ...this.buildDeleteConditionExpression(options?.condition),
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await this._ddb.deleteItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      return;
    })();
  }

  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[]): Promise<ModelBatchGetOutput<M>>;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options: Omit<ModelBatchGetOptions<M>, 'return'>): Promise<ModelBatchGetOutput<M>>;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options: ModelBatchGetOptions<M> & { return: 'default' }): Promise<InstanceType<M>>;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options: ModelBatchGetOptions<M> & { return: 'output' }): Promise<BatchGetItemCommandOutput>;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options: ModelBatchGetOptions<M> & { return: 'input' }): BatchGetItemCommandInput;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options?: ModelBatchGetOptions<M>): Promise<ModelBatchGetOutput<M> | BatchGetItemCommandOutput> | BatchGetItemCommandInput {
    const commandInput: BatchGetItemCommandInput = {
      RequestItems: {
        [this.table.tableName]: {
          Keys: primaryKeys.map((primaryKey) => this.convertPrimaryKeyToDynamo(primaryKey)),
          ConsistentRead: options?.consistent || false,
          ...this.buildGetProjectionExpression(options?.attributes),
        },
      },
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await this._ddb.batchGetItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      const items = result.Responses?.[this.table.tableName] || [];
      const unprocessedKeys = result.UnprocessedKeys?.[this.table.tableName]?.Keys?.map((key) => this.convertDynamoKeysToSymbols(fromDynamo(key)) as PrimaryKey<M>) || [];

      return { items: items.map((item) => this.parseFromDynamo(item)), unprocessedKeys };
    })();
  }

  public static batchPut<M extends typeof Model>(this: M, items: Array<InstanceType<M>>): Promise<ModelBatchPutOutput<M>>;
  public static batchPut<M extends typeof Model>(this: M, items: Array<InstanceType<M>>, options: Omit<ModelBatchPutOptions, 'return'>): Promise<ModelBatchPutOutput<M>>;
  public static batchPut<M extends typeof Model>(this: M, items: Array<InstanceType<M>>, options: ModelBatchPutOptions & { return: 'default' }): Promise<ModelBatchPutOutput<M>>;
  public static batchPut<M extends typeof Model>(this: M, items: Array<InstanceType<M>>, options: ModelBatchPutOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
  public static batchPut<M extends typeof Model>(this: M, items: Array<InstanceType<M>>, options: ModelBatchPutOptions & { return: 'input' }): BatchWriteItemCommandInput;
  public static batchPut<M extends typeof Model>(this: M, items: Array<InstanceType<M>>, options?: ModelBatchPutOptions): Promise<ModelBatchPutOutput<M> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
    const commandInput: BatchWriteItemCommandInput = {
      RequestItems: {
        [this.table.tableName]: items.map((item) => ({
          PutRequest: {
            Item: this.modelToDynamo(item),
          },
        })),
      },
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await this._ddb.batchWriteItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      const unprocessedItems =
        result.UnprocessedItems?.[this.table.tableName]
          ?.map((request) => request.PutRequest?.Item)
          ?.filter((item): item is AttributeMap => !!item)
          ?.map((item) => this.parseFromDynamo(item)) || [];

      return { items, unprocessedItems };
    })();
  }

  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[]): Promise<ModelBatchDeleteOutput<M>>;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options: Omit<ModelBatchDeleteOptions, 'return'>): Promise<ModelBatchDeleteOutput<M>>;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options: ModelBatchDeleteOptions & { return: 'default' }): Promise<ModelBatchDeleteOutput<M>>;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options: ModelBatchDeleteOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options: ModelBatchDeleteOptions & { return: 'input' }): BatchWriteItemCommandInput;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey<M>[], options?: ModelBatchDeleteOptions): Promise<ModelBatchDeleteOutput<M> | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
    const commandInput: BatchWriteItemCommandInput = {
      RequestItems: {
        [this.table.tableName]: primaryKeys.map((primaryKey) => ({
          DeleteRequest: {
            Key: this.convertPrimaryKeyToDynamo(primaryKey),
          },
        })),
      },
      ...options?.extraInput,
    };

    if (options?.return === 'input') {
      return commandInput;
    }

    return (async () => {
      const result = await this._ddb.batchWriteItem(commandInput);

      if (options?.return === 'output') {
        return result;
      }

      const unprocessedItems =
        result.UnprocessedItems?.[this.table.tableName]
          ?.map((request) => request.DeleteRequest?.Key)
          ?.filter((item): item is AttributeMap => !!item)
          .map((key) => this.convertDynamoKeysToSymbols(fromDynamo(key)) as PrimaryKey<M>) || [];

      return { unprocessedItems };
    })();
  }

  public static parseFromDynamo<M extends typeof Model>(this: M, dynamoItem: AttributeMap): InstanceType<M> {
    const props = this.modelFromDynamo(dynamoItem);
    const item = new this(props) as InstanceType<M>;
    return item;
  }

  private static convertSymbolsToDynamoKeys<M extends typeof Model>(this: M, object: GenericObject): GenericObject {
    Object.getOwnPropertySymbols(object).forEach((symbolKey) => {
      const dynamoDbKey = this.table[symbolKey as keyof Table];
      const value = object[symbolKey];

      if (dynamoDbKey) {
        if (value instanceof Date && [createdAt, updatedAt].includes(symbolKey)) {
          object[dynamoDbKey] = getTimestampValue(value, this.table.timestampsType);
        } else if (symbolKey === partitionKey && typeof value === 'string') {
          object[dynamoDbKey] = addPrefixSuffix(this.prefixPk, value, this.suffixPk);
        } else if (symbolKey === sortKey && typeof value === 'string') {
          object[dynamoDbKey] = addPrefixSuffix(this.prefixSk, value, this.suffixSk);
        } else {
          object[dynamoDbKey] = value;
        }
        delete object[symbolKey];
      }
    });

    return object;
  }

  private static convertDynamoKeysToSymbols<M extends typeof Model>(this: M, object: GenericObject): GenericObject {
    Object.getOwnPropertySymbols(this.table).forEach((symbolKey) => {
      const dynamoDbKey = this.table[symbolKey as keyof Table];
      const value = object[dynamoDbKey];

      if (dynamoDbKey) {
        if ([createdAt, updatedAt].includes(symbolKey) && (typeof value === 'string' || typeof value === 'number')) {
          object[symbolKey] = new Date(value);
        } else if (symbolKey === partitionKey && typeof value === 'string') {
          object[symbolKey] = truncatePrefixSuffix(this.prefixPk, value, this.suffixPk);
        } else if (symbolKey === sortKey && typeof value === 'string') {
          object[symbolKey] = truncatePrefixSuffix(this.prefixSk, value, this.suffixSk);
        } else {
          object[symbolKey] = value;
        }
        delete object[dynamoDbKey];
      }
    });

    return object;
  }

  private static modelToDynamo<M extends typeof Model>(this: M, item: InstanceType<M>): AttributeMap {
    const object = classToObject(item);
    this.convertSymbolsToDynamoKeys(object);
    return objectToDynamo(object);
  }

  private static modelFromDynamo<M extends typeof Model>(this: M, attributeMap: AttributeMap): ModelProps<typeof Table> {
    const object = fromDynamo(attributeMap);
    const item = this.convertDynamoKeysToSymbols(object);
    return item as ModelProps<typeof Table>;
  }

  private static convertPrimaryKeyToDynamo<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>): AttributeMap {
    return objectToDynamo(this.convertSymbolsToDynamoKeys(primaryKey));
  }

  private static convertToDynamoKey<M extends typeof Model>(this: M, key: string | symbol | number): string | number {
    if (typeof key === 'symbol') {
      return this.table[key as keyof Table];
    }
    return key;
  }

  private static buildGetProjectionExpression<M extends typeof Model>(this: M, attributes?: Array<keyof ModelKeys<InstanceType<M>>>): BuildGetProjectionExpression {
    const attributeNames: Record<string, string> = {};
    const projectionExpression = attributes
      ?.map((attribute) => this.convertToDynamoKey(attribute))
      ?.map((attribute) => substituteAttributeName(attributeNames, `${attribute}`))
      .join(', ');

    return {
      ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
      ...(projectionExpression ? { ProjectionExpression: projectionExpression } : {}),
    };
  }

  private static buildUpdateConditionExpression<M extends typeof Model>(this: M, props: UpdateProps<InstanceType<M>>): BuildUpdateConditionExpression {
    const attributeNames: Record<string, string> = {};
    const attributeValues: AttributeMap = {};
    const conditions = this.buildUpdateConditions(props);
    const updateExpression = buildExpression(conditions, attributeNames, attributeValues);

    return {
      ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
      ...(!isEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
      ...(updateExpression ? { UpdateExpression: updateExpression } : {}),
    };
  }

  private static buildUpdateConditions<M extends typeof Model>(this: M, props: UpdateProps<InstanceType<M>>): ConditionExpression[] {
    const { set, setIfNotExists, listAppend, increment, decrement, add, delete: deleteOp, remove } = props;
    const conditions: ConditionExpression[] = [];

    const setKeys: string[] = [];
    const setValues: unknown[] = [];
    const setExpr: string[] = [];

    const updatedAtDynamoKey = this.table[updatedAt];
    const timestampType = this.table.timestampsType;
    if (updatedAtDynamoKey && timestampType) {
      setKeys.push(updatedAtDynamoKey);
      setValues.push(getTimestampValue(new Date(), timestampType));
      setExpr.push('$K = $V');
    }

    if (set && !isEmptyWithoutSymbols(set)) {
      const convertedSet = this.convertSymbolsToDynamoKeys(set);
      setKeys.push(...Object.keys(convertedSet));
      setValues.push(...Object.values(convertedSet));
      setExpr.push(...Object.keys(convertedSet).map(() => '$K = $V'));
      console.log(convertedSet, setKeys, setValues, setExpr);
    }

    if (setIfNotExists && !isEmptyWithoutSymbols(setIfNotExists)) {
      const convertedSetIfNotExists = this.convertSymbolsToDynamoKeys(setIfNotExists);
      setKeys.push(...Object.keys(convertedSetIfNotExists).flatMap((k) => [k, k]));
      setValues.push(...Object.values(convertedSetIfNotExists));
      setExpr.push(...Object.keys(convertedSetIfNotExists).map(() => '$K = if_not_exists($K, $V)'));
    }

    if (listAppend && !isEmptyWithoutSymbols(listAppend)) {
      const convertedListAppend = this.convertSymbolsToDynamoKeys(listAppend);
      setKeys.push(...Object.keys(convertedListAppend).flatMap((k) => [k, k]));
      setValues.push(...Object.values(convertedListAppend));
      setExpr.push(...Object.keys(convertedListAppend).map(() => '$K = list_append($K, $V)'));
    }

    if (increment && !isEmptyWithoutSymbols(increment)) {
      const convertedIncrement = this.convertSymbolsToDynamoKeys(increment);
      setKeys.push(...Object.keys(convertedIncrement).flatMap((k) => [k, k]));
      setValues.push(...Object.values(convertedIncrement));
      setExpr.push(...Object.keys(convertedIncrement).map(() => '$K = $K + $V'));
    }

    if (decrement && !isEmptyWithoutSymbols(decrement)) {
      const convertedDecrement = this.convertSymbolsToDynamoKeys(decrement);
      setKeys.push(...Object.keys(convertedDecrement).flatMap((k) => [k, k]));
      setValues.push(...Object.values(convertedDecrement));
      setExpr.push(...Object.keys(convertedDecrement).map(() => '$K = $K - $V'));
    }

    if (setExpr.length > 0) {
      conditions.push({ expr: 'SET' }, { keys: setKeys, values: setValues, expr: setExpr.join(', ') });
    }

    if (add && !isEmptyWithoutSymbols(add)) {
      const convertedAdd = this.convertSymbolsToDynamoKeys(add);
      conditions.push(
        { expr: 'ADD' },
        {
          keys: Object.keys(convertedAdd),
          values: Object.values(convertedAdd),
          expr: Object.keys(convertedAdd)
            .map(() => '$K $V')
            .join(', '),
        },
      );
    }

    if (deleteOp && !isEmptyWithoutSymbols(deleteOp)) {
      const convertedDeleteOp = this.convertSymbolsToDynamoKeys(deleteOp);
      conditions.push(
        { expr: 'DELETE' },
        {
          keys: Object.keys(convertedDeleteOp),
          values: Object.values(convertedDeleteOp),
          expr: Object.keys(convertedDeleteOp)
            .map(() => '$K $V')
            .join(', '),
        },
      );
    }

    if (remove && remove.length > 0) {
      conditions.push({ expr: 'REMOVE' }, { keys: remove.map((key) => this.convertToDynamoKey(key)).map((key) => `${key}`), expr: remove.map(() => '$K').join(', ') });
    }

    return conditions;
  }

  private static buildPutConditionExpression<M extends typeof Model>(this: M, overwriteCondition?: ConditionInstance<M>, optionsCondition?: ConditionInstance<M>): BuildPutConditionExpression {
    const attributeNames: Record<string, string> = {};
    const attributeValues: AttributeMap = {};
    let conditionExpression: string | undefined = undefined;

    if (overwriteCondition && optionsCondition) {
      conditionExpression = buildExpression(overwriteCondition.condition(optionsCondition).conditions, attributeNames, attributeValues);
    } else if (overwriteCondition) {
      conditionExpression = buildExpression(overwriteCondition.conditions, attributeNames, attributeValues);
    } else if (optionsCondition) {
      conditionExpression = buildExpression(optionsCondition.conditions, attributeNames, attributeValues);
    }

    return {
      ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
      ...(!isEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
      ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
    };
  }

  private static buildDeleteConditionExpression<M extends typeof Model>(this: M, optionsCondition?: ConditionInstance<M>): BuildDeleteConditionExpression {
    const attributeNames: Record<string, string> = {};
    const attributeValues: AttributeMap = {};
    const conditionExpression = buildExpression(optionsCondition?.conditions || [], attributeNames, attributeValues);

    return {
      ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
      ...(!isEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
      ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
    };
  }

  static set ddb(value: DynamoDB) {
    this._ddb = value;
  }

  static get ddb() {
    return this._ddb;
  }
}
