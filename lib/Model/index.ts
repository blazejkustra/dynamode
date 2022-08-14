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
import { Condition } from '@lib/Condition';
import { Query } from '@lib/Query';
import { Table } from '@lib/Table';
import { AttributeMap, classToObject, fromDynamo, GenericObject, NotFoundError, objectToDynamo, SEPARATOR } from '@lib/utils';
import { buildProjectionExpression } from '@lib/utils/projectionExpression';
import { substituteModelDeleteConditions, substituteModelPutConditions, substituteModelUpdateConditions } from '@lib/utils/substituteConditions';
import { gsi1PartitionKey, gsi1SortKey, gsi2PartitionKey, gsi2SortKey, lsi1SortKey, lsi2SortKey, partitionKey, sortKey } from '@lib/utils/symbols';
import {
  ModelBatchDeleteOptions,
  ModelBatchDeleteOutput,
  ModelBatchGetOptions,
  ModelBatchGetOutput,
  ModelBatchPutOptions,
  ModelBatchPutOutput,
  ModelCreateOptions,
  ModelDeleteOptions,
  ModelGetOptions,
  ModelProps,
  ModelPutOptions,
  ModelUpdateOptions,
  PrimaryKey,
  UpdateProps,
} from '@Model/types';

export class Model {
  private static _ddb: DynamoDB;

  public static prefixPk: string;
  public static prefixSk: string;
  public static suffixPk: string;
  public static suffixSk: string;
  public static table: typeof Table;

  [partitionKey]: string | number;
  [sortKey]: string | number;

  [gsi1PartitionKey]?: string | number;
  [gsi2PartitionKey]?: string | number;

  [gsi1SortKey]?: string | number;
  [gsi2SortKey]?: string | number;

  [lsi1SortKey]?: string | number;
  [lsi2SortKey]?: string | number;

  constructor(props: ModelProps<Table>) {
    this[partitionKey] = props[partitionKey];
    this[sortKey] = props[sortKey];

    this[gsi1PartitionKey] = props[gsi1PartitionKey];
    this[gsi1SortKey] = props[gsi1SortKey];

    this[gsi2PartitionKey] = props[gsi2PartitionKey];
    this[gsi2SortKey] = props[gsi2SortKey];

    this[lsi1SortKey] = props[lsi1SortKey];
    this[lsi2SortKey] = props[lsi2SortKey];
  }

  public static query<M extends typeof Model>(this: M, key: typeof partitionKey | typeof gsi1PartitionKey, value: string | number): InstanceType<typeof Query<M>> {
    return new Query(this, key, value);
  }

  public static condition<M extends typeof Model>(this: M, key: string): InstanceType<typeof Condition<M>> {
    return new Condition(this, key);
  }

  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey): Promise<InstanceType<M>>;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: Omit<ModelGetOptions<M>, 'return'>): Promise<InstanceType<M>>;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: ModelGetOptions<M> & { return: 'default' }): Promise<InstanceType<M>>;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: ModelGetOptions<M> & { return: 'output' }): Promise<GetItemCommandOutput>;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: ModelGetOptions<M> & { return: 'input' }): GetItemCommandInput;
  public static get<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options?: ModelGetOptions<M>): Promise<InstanceType<M> | GetItemCommandOutput> | GetItemCommandInput {
    const commandInput: GetItemCommandInput = {
      TableName: this.table.tableName,
      Key: objectToDynamo(this.appendPrefixSuffix(primaryKey)),
      ConsistentRead: options?.consistent || false,
      ...buildProjectionExpression(options?.attributes),
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

  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey, props: UpdateProps<InstanceType<M>>): Promise<InstanceType<M>>;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey, props: UpdateProps<InstanceType<M>>, options: Omit<ModelUpdateOptions<M>, 'return'>): Promise<InstanceType<M>>;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey, props: UpdateProps<InstanceType<M>>, options: ModelUpdateOptions<M> & { return: 'default' }): Promise<InstanceType<M>>;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey, props: UpdateProps<InstanceType<M>>, options: ModelUpdateOptions<M> & { return: 'output' }): Promise<UpdateItemCommandOutput>;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey, props: UpdateProps<InstanceType<M>>, options: ModelUpdateOptions<M> & { return: 'input' }): UpdateItemCommandInput;
  public static update<M extends typeof Model>(this: M, primaryKey: PrimaryKey, props: UpdateProps<InstanceType<M>>, options?: ModelUpdateOptions<M>): Promise<InstanceType<M> | UpdateItemCommandOutput> | UpdateItemCommandInput {
    const commandInput: UpdateItemCommandInput = {
      TableName: this.table.tableName,
      Key: objectToDynamo(this.appendPrefixSuffix(primaryKey)),
      ReturnValues: 'ALL_NEW',
      ...substituteModelUpdateConditions(props),
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
      ...substituteModelPutConditions(overwriteCondition, options?.condition),
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

  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey): Promise<void>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: Omit<ModelDeleteOptions<M>, 'return'>): Promise<void>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: ModelDeleteOptions<M> & { return: 'default' }): Promise<void>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: ModelDeleteOptions<M> & { return: 'output' }): Promise<DeleteItemCommandOutput>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: ModelDeleteOptions<M> & { return: 'input' }): DeleteItemCommandInput;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options?: ModelDeleteOptions<M>): Promise<void | DeleteItemCommandOutput> | DeleteItemCommandInput {
    const commandInput: DeleteItemCommandInput = {
      TableName: this.table.tableName,
      Key: objectToDynamo(this.appendPrefixSuffix(primaryKey)),
      ...substituteModelDeleteConditions(options?.condition),
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

  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[]): Promise<ModelBatchGetOutput<M>>;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options: Omit<ModelBatchGetOptions<M>, 'return'>): Promise<ModelBatchGetOutput<M>>;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options: ModelBatchGetOptions<M> & { return: 'default' }): Promise<InstanceType<M>>;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options: ModelBatchGetOptions<M> & { return: 'output' }): Promise<BatchGetItemCommandOutput>;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options: ModelBatchGetOptions<M> & { return: 'input' }): BatchGetItemCommandInput;
  public static batchGet<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options?: ModelBatchGetOptions<M>): Promise<ModelBatchGetOutput<M> | BatchGetItemCommandOutput> | BatchGetItemCommandInput {
    const commandInput: BatchGetItemCommandInput = {
      RequestItems: {
        [this.table.tableName]: {
          Keys: primaryKeys.map((primaryKey) => objectToDynamo(this.appendPrefixSuffix(primaryKey))),
          ConsistentRead: options?.consistent || false,
          ...buildProjectionExpression(options?.attributes),
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
      const unprocessedKeys = result.UnprocessedKeys?.[this.table.tableName]?.Keys?.map((key) => this.primaryKeyFromDynamo(fromDynamo(key)) as PrimaryKey) || [];

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

  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[]): Promise<ModelBatchDeleteOutput>;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options: Omit<ModelBatchDeleteOptions, 'return'>): Promise<ModelBatchDeleteOutput>;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options: ModelBatchDeleteOptions & { return: 'default' }): Promise<ModelBatchDeleteOutput>;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options: ModelBatchDeleteOptions & { return: 'output' }): Promise<BatchWriteItemCommandOutput>;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options: ModelBatchDeleteOptions & { return: 'input' }): BatchWriteItemCommandInput;
  public static batchDelete<M extends typeof Model>(this: M, primaryKeys: PrimaryKey[], options?: ModelBatchDeleteOptions): Promise<ModelBatchDeleteOutput | BatchWriteItemCommandOutput> | BatchWriteItemCommandInput {
    const commandInput: BatchWriteItemCommandInput = {
      RequestItems: {
        [this.table.tableName]: primaryKeys.map((primaryKey) => ({
          DeleteRequest: {
            Key: objectToDynamo(this.appendPrefixSuffix(primaryKey)),
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
          .map((key) => this.primaryKeyFromDynamo(fromDynamo(key)) as PrimaryKey) || [];

      return { unprocessedItems };
    })();
  }

  public static parseFromDynamo<M extends typeof Model>(this: M, dynamoItem: AttributeMap): InstanceType<M> {
    const item = this.modelFromDynamo(dynamoItem);
    return new this(item as any) as InstanceType<M>;
  }

  private static modelToDynamo<M extends typeof Model>(this: M, item: InstanceType<M>): AttributeMap {
    const object = classToObject(item);
    this.primaryKeyToDynamo(object, item);
    this.indexesToDynamo(object);
    return objectToDynamo(object);
  }

  private static primaryKeyToDynamo<M extends typeof Model>(this: M, object: GenericObject, item: InstanceType<M>): GenericObject {
    const primaryKey = this.appendPrefixSuffix({ [partitionKey]: item[partitionKey], [sortKey]: item[sortKey] });
    object[this.table[partitionKey]] = primaryKey[this.table[partitionKey]];
    delete object[partitionKey];

    object[this.table[sortKey]] = primaryKey[this.table[sortKey]];
    delete object[sortKey];

    return object;
  }

  private static indexesToDynamo<M extends typeof Model>(this: M, object: GenericObject): GenericObject {
    object[this.table[gsi1PartitionKey]] = object[gsi1PartitionKey];
    delete object[gsi1PartitionKey];

    object[this.table[gsi1SortKey]] = object[gsi1SortKey];
    delete object[gsi1SortKey];

    object[this.table[lsi1SortKey]] = object[lsi1SortKey];
    delete object[lsi1SortKey];

    object[this.table[lsi2SortKey]] = object[lsi2SortKey];
    delete object[lsi2SortKey];

    return object;
  }

  private static modelFromDynamo<M extends typeof Model>(this: M, attributeMap: AttributeMap): GenericObject {
    const item = fromDynamo(attributeMap);
    this.primaryKeyFromDynamo(item);
    this.indexesFromDynamo(item);
    return item;
  }

  private static primaryKeyFromDynamo<M extends typeof Model>(this: M, item: GenericObject): GenericObject {
    item[partitionKey] = this.truncatePrefixSuffixPk(item);
    delete item[this.table[partitionKey]];

    item[sortKey] = this.truncatePrefixSuffixSk(item);
    delete item[this.table[sortKey]];

    return item;
  }

  private static indexesFromDynamo<M extends typeof Model>(this: M, item: GenericObject): GenericObject {
    item[gsi1PartitionKey] = item[this.table[gsi1PartitionKey]];
    delete item[this.table[gsi1PartitionKey]];

    item[gsi1SortKey] = item[this.table[gsi1SortKey]];
    delete item[this.table[gsi1SortKey]];

    item[lsi2SortKey] = item[this.table[lsi2SortKey]];
    delete item[this.table[lsi2SortKey]];

    return item;
  }

  private static appendPrefixSuffix<M extends typeof Model>(this: M, primaryKey: PrimaryKey): GenericObject {
    const { table, prefixPk, prefixSk, suffixPk, suffixSk } = this;
    return {
      [table[partitionKey]]: [prefixPk, primaryKey[partitionKey], suffixPk].filter((p) => p).join(SEPARATOR),
      [table[sortKey]]: [prefixSk, primaryKey[sortKey], suffixSk].filter((s) => s).join(SEPARATOR),
    };
  }

  private static truncatePrefixSuffixPk<M extends typeof Model>(this: M, item: GenericObject): string {
    const { table, prefixPk, suffixPk } = this;
    return ((item[table[partitionKey]] as string) || '').replace(`${prefixPk}${SEPARATOR}`, '').replace(`${SEPARATOR}${suffixPk}`, '');
  }

  private static truncatePrefixSuffixSk<M extends typeof Model>(this: M, item: GenericObject): string {
    const { table, prefixSk, suffixSk } = this;
    return ((item[table[sortKey]] as string) || '').replace(`${prefixSk}${SEPARATOR}`, '').replace(`${SEPARATOR}${suffixSk}`, '');
  }

  static set ddb(value: DynamoDB) {
    this._ddb = value;
  }

  static get ddb() {
    return this._ddb;
  }
}
