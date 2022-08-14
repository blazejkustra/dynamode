import { DeleteItemCommandInput, DeleteItemCommandOutput, DynamoDB, GetItemCommandInput, GetItemCommandOutput, PutItemCommandInput, PutItemCommandOutput, UpdateItemCommandInput, UpdateItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { Condition } from '@lib/Condition';
import { Query } from '@lib/Query';
import { Table } from '@lib/Table';
import { AttributeMap, classToObject, fromDynamo, GenericObject, NotFoundError, objectToDynamo, SEPARATOR } from '@lib/utils';
import { replaceNestedAttributesRegex, substituteModelDeleteConditions, substituteModelPutConditions, substituteModelUpdateConditions } from '@lib/utils/substituteConditions';
import { gsi1PartitionKey, gsi1SortKey, gsi2PartitionKey, gsi2SortKey, lsi1SortKey, lsi2SortKey, partitionKey, sortKey } from '@lib/utils/symbols';
import { ModelDeleteOptions, ModelProps, ModelPutOptions, ModelUpdateOptions, PrimaryKey, UpdateProps } from '@Model/types';

import { ModelGetOptions } from './types';

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
      Key: objectToDynamo(this.appendPrefixSuffix(this, primaryKey)),
      ConsistentRead: options?.consistent || false,
      ProjectionExpression: options?.attributes?.map((attr) => replaceNestedAttributesRegex(`${attr}`)).join(', '),
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

      return this.parseFromDynamo(this, result.Item || {});
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
      Key: objectToDynamo(this.appendPrefixSuffix(this, primaryKey)),
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

      return this.parseFromDynamo(this, result.Attributes || {});
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
      Item: this.modelToDynamo(this, item),
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

  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey): Promise<void>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: Omit<ModelDeleteOptions<M>, 'return'>): Promise<void>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: ModelDeleteOptions<M> & { return: 'default' }): Promise<void>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: ModelDeleteOptions<M> & { return: 'output' }): Promise<DeleteItemCommandOutput>;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options: ModelDeleteOptions<M> & { return: 'input' }): DeleteItemCommandInput;
  public static delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey, options?: ModelDeleteOptions<M>): Promise<void | DeleteItemCommandOutput> | DeleteItemCommandInput {
    const commandInput: DeleteItemCommandInput = {
      TableName: this.table.tableName,
      Key: objectToDynamo(this.appendPrefixSuffix(this, primaryKey)),
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

  public static parseFromDynamo<M extends typeof Model>(model: M, dynamoItem: AttributeMap): InstanceType<M> {
    const item = this.modelFromDynamo(this, dynamoItem);
    return new model(item as any) as InstanceType<M>;
  }

  private static modelToDynamo<M extends typeof Model>(model: M, item: InstanceType<M>): AttributeMap {
    const primaryKey = { [partitionKey]: item[partitionKey], [sortKey]: item[sortKey] };
    const object = classToObject(item, this.appendPrefixSuffix(model, primaryKey));
    delete object[partitionKey];
    delete object[sortKey];

    object[this.table[gsi1PartitionKey]] = object[gsi1PartitionKey];
    delete object[gsi1PartitionKey];

    object[this.table[gsi1SortKey]] = object[gsi1SortKey];
    delete object[gsi1SortKey];

    object[this.table[lsi1SortKey]] = object[lsi1SortKey];
    delete object[lsi1SortKey];

    object[this.table[lsi2SortKey]] = object[lsi2SortKey];
    delete object[lsi2SortKey];

    return objectToDynamo(object);
  }

  private static modelFromDynamo<M extends typeof Model>(model: M, attributeMap: AttributeMap): GenericObject {
    const { table } = model;
    const item = fromDynamo(attributeMap);

    item[partitionKey] = this.truncatePrefixSuffixPk(model, item);
    delete item[table[partitionKey]];

    item[sortKey] = this.truncatePrefixSuffixSk(model, item);
    delete item[table[sortKey]];

    item[gsi1PartitionKey] = item[table[gsi1PartitionKey]];
    delete item[table[gsi1PartitionKey]];

    item[gsi1SortKey] = item[table[gsi1SortKey]];
    delete item[table[gsi1SortKey]];

    item[lsi2SortKey] = item[table[lsi2SortKey]];
    delete item[table[lsi2SortKey]];

    return item;
  }

  private static appendPrefixSuffix<M extends typeof Model>(model: M, primaryKey: PrimaryKey): GenericObject {
    const { table, prefixPk, prefixSk, suffixPk, suffixSk } = model;
    return {
      [table[partitionKey]]: [prefixPk, primaryKey[partitionKey], suffixPk].filter((p) => p).join(SEPARATOR),
      [table[sortKey]]: [prefixSk, primaryKey[sortKey], suffixSk].filter((s) => s).join(SEPARATOR),
    };
  }

  private static truncatePrefixSuffixPk<M extends typeof Model>(model: M, item: GenericObject): string {
    const { table, prefixPk, suffixPk } = model;

    return ((item[table[partitionKey]] as string) || '').replace(`${prefixPk}${SEPARATOR}`, '').replace(`${SEPARATOR}${suffixPk}`, '');
  }

  private static truncatePrefixSuffixSk<M extends typeof Model>(model: M, item: GenericObject): string {
    const { table, prefixSk, suffixSk } = model;

    return ((item[table[sortKey]] as string) || '').replace(`${prefixSk}${SEPARATOR}`, '').replace(`${SEPARATOR}${suffixSk}`, '');
  }

  static set ddb(value: DynamoDB) {
    this._ddb = value;
  }

  static get ddb() {
    return this._ddb;
  }
}
