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
  SEPARATOR,
} from '@lib/utils';
import {
  gsi1PartitionKey,
  gsi1SortKey,
  gsi2PartitionKey,
  gsi2SortKey,
  partitionKey,
  sortKey,
} from '@lib/utils/symbols';
import { ModelProps, PrimaryKey } from '@Model/types';

export class Model {
  private static _ddb: DynamoDB;

  public static prefixPk: string;
  public static prefixSk: string;
  public static suffixPk: string;
  public static suffixSk: string;
  public static table: typeof Table;

  [partitionKey]: string;
  [sortKey]: string;

  [gsi1PartitionKey]?: string;
  [gsi1SortKey]?: string;

  [gsi2PartitionKey]?: string;
  [gsi2SortKey]?: string;

  constructor(props: ModelProps<Table>) {
    this[partitionKey] = props[partitionKey];
    this[sortKey] = props[sortKey];

    this[gsi1PartitionKey] = props[gsi1PartitionKey];
    this[gsi1SortKey] = props[gsi1SortKey];

    this[gsi1PartitionKey] = props[gsi2PartitionKey];
    this[gsi1SortKey] = props[gsi2SortKey];
  }

  public static query<M extends typeof Model>(this: M, options: QueryOptions): InstanceType<typeof Query<M>> {
    return new Query(this, options);
  }

  public static async get<M extends typeof Model>(this: M, primaryKey: PrimaryKey): Promise<InstanceType<M>> {
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
    primaryKey: PrimaryKey,
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

  public static async delete<M extends typeof Model>(this: M, primaryKey: PrimaryKey): Promise<void> {
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
    const primaryKey = { [partitionKey]: item[partitionKey], [sortKey]: item[sortKey] };
    const object = classToObject(item, this.appendPrefixSuffix(model, primaryKey));
    delete object[partitionKey];
    delete object[sortKey];

    object[this.table[gsi1PartitionKey]] = object[gsi1PartitionKey];
    delete object[gsi1PartitionKey];

    object[this.table[gsi1SortKey]] = object[gsi1SortKey];
    delete object[gsi1SortKey];

    removeUndefinedInObject(object);
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
    delete item[table[partitionKey]];

    item[gsi1SortKey] = item[table[gsi1SortKey]];
    delete item[table[sortKey]];

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

    return (item[table[partitionKey]] as string)
      .replace(`${prefixPk}${SEPARATOR}`, '')
      .replace(`${SEPARATOR}${suffixPk}`, '');
  }

  private static truncatePrefixSuffixSk<M extends typeof Model>(model: M, item: GenericObject): string {
    const { table, prefixSk, suffixSk } = model;

    return (item[table[sortKey]] as string)
      .replace(`${prefixSk}${SEPARATOR}`, '')
      .replace(`${SEPARATOR}${suffixSk}`, '');
  }

  static set ddb(value: DynamoDB) {
    this._ddb = value;
  }
}
