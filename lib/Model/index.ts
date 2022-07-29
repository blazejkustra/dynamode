import type { DynamoDB } from '@aws-sdk/client-dynamodb';
import { Query, QueryOptions } from '@lib/Query';
import { Table } from '@lib/Table';
import {
  AttributeMap,
  classToObject,
  fromDynamo,
  GenericObject,
  NotFoundError,
  objectToDynamo,
  removeUndefinedInObject,
  SYMBOL,
} from '@lib/utils';
import { GlobalSecondaryIndex, PrimaryKey, TablePrimaryKey } from '@Model/types';

export interface ModelProps<T extends typeof Table> {
  pk: TablePrimaryKey<T>;
  gsi1?: GlobalSecondaryIndex<T>;
}

export class Model {
  private static _ddb: DynamoDB;

  public static prefixPk: string;
  public static prefixSk: string;
  public static suffixPk: string;
  public static suffixSk: string;
  public static table: typeof Table;

  public pk: TablePrimaryKey<typeof Table>;
  public gsi1?: GlobalSecondaryIndex<typeof Table>;

  constructor(props: ModelProps<typeof Table>) {
    this.pk = props.pk;
    this.gsi1 = props.gsi1;
  }

  public static query<M extends typeof Model>(this: M, options: QueryOptions): InstanceType<typeof Query<M>> {
    return new Query(this, options);
  }

  public static async get<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>): Promise<InstanceType<M>> {
    const result = await this._ddb.getItem({
      TableName: this.table.tableName,
      Key: objectToDynamo(this.appendPrefixSuffix(this, primaryKey)),
    });

    if (!result || !result.Item) {
      throw new NotFoundError();
    }

    return this.parseFromDynamo(this, result.Item || {});
  }

  public static async update<M extends typeof Model>(
    this: M,
    primaryKey: PrimaryKey<M>,
    props: Omit<Partial<ConstructorParameters<M>[0]>, keyof M>,
  ): Promise<InstanceType<M>> {
    const result = await this._ddb.updateItem({
      TableName: this.table.tableName,
      Key: objectToDynamo(this.appendPrefixSuffix(this, primaryKey)),
      ReturnValues: 'ALL_NEW',
      //TODO: implement better querying!!!
      UpdateExpression: `set ${Object.entries(props)
        .map(([key]) => `${key} = :${key}`)
        .join(', ')}`,
      ExpressionAttributeValues: objectToDynamo({
        ...Object.fromEntries(Object.entries(props).map(([key, value]) => [`:${key}`, value])),
      }),
    });

    return this.parseFromDynamo(this, result.Attributes || {});
  }

  public static async put<M extends typeof Model>(this: M, item: InstanceType<M>): Promise<InstanceType<M>> {
    await this._ddb.putItem({
      TableName: this.table.tableName,
      Item: this.modelToDynamo(this, item),
    });

    return item;
  }

  public static async delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey<M>): Promise<void> {
    await this._ddb.deleteItem({
      TableName: this.table.tableName,
      Key: objectToDynamo(this.appendPrefixSuffix(this, primaryKey)),
    });
  }

  private static parseFromDynamo<M extends typeof Model>(model: M, dynamoItem: AttributeMap): InstanceType<M> {
    const item = this.modelFromDynamo(this, dynamoItem);
    return new model(item as any) as InstanceType<M>;
  }

  private static modelToDynamo<M extends typeof Model>(model: M, item: InstanceType<M>): AttributeMap {
    const object = classToObject(item, this.appendPrefixSuffix(model, item.pk));
    delete object.pk;
    delete object.gsi1;
    delete object.table;
    removeUndefinedInObject(object);
    return objectToDynamo(object);
  }

  private static modelFromDynamo<M extends typeof Model>(model: M, attributeMap: AttributeMap): GenericObject {
    const { table } = model;
    const item = fromDynamo(attributeMap);
    item.pk = this.truncatePrefixSuffix(model, {
      [table.partitionKey]: item[table.partitionKey],
      [table.sortKey]: item[table.sortKey],
    });

    delete item[table.partitionKey];
    delete item[table.sortKey];

    return item;
  }

  private static appendPrefixSuffix<M extends typeof Model>(model: M, primaryKey: GenericObject): GenericObject {
    const { table, prefixPk, prefixSk, suffixPk, suffixSk } = model;
    const partitionKey = [prefixPk, primaryKey[table.partitionKey], suffixPk].filter((p) => p).join(SYMBOL);
    const sortKey = [prefixSk, primaryKey[table.sortKey], suffixSk].filter((s) => s).join(SYMBOL);

    return {
      [table.partitionKey]: partitionKey,
      [table.sortKey]: sortKey,
    };
  }

  private static truncatePrefixSuffix<M extends typeof Model>(model: M, primaryKey: GenericObject): GenericObject {
    const { table, prefixPk, prefixSk, suffixPk, suffixSk } = model;
    let partitionKey = primaryKey[table.partitionKey];
    let sortKey = primaryKey[table.sortKey];

    if (typeof partitionKey === 'string') {
      partitionKey = partitionKey.replace(`${prefixPk}${SYMBOL}`, '').replace(`${SYMBOL}${suffixPk}`, '');
    }

    if (typeof sortKey === 'string') {
      sortKey = sortKey.replace(`${prefixSk}${SYMBOL}`, '').replace(`${SYMBOL}${suffixSk}`, '');
    }

    return {
      [table.partitionKey]: partitionKey,
      [table.sortKey]: sortKey,
    };
  }

  static set ddb(value: DynamoDB) {
    this._ddb = value;
  }
}
