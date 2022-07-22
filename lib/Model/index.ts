import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { CompositeKey, SimpleKey } from '../Table/types';
import { error } from '../utils';
import { convertPrimaryKey, fromDynamo, GenericObject, modelToDynamo, objectToDynamo } from '../utils/converter';
import { Table } from '../Table';

export type ChildProps<M extends typeof Model> = Omit<Partial<ConstructorParameters<M>[0]>, keyof Model>;

export class Model {
  public static table: Table;
  public static ddb: DynamoDB;
  public pk: string;
  public sk: string;
  public prefix?: string;
  public suffix?: string;

  constructor(props: Model) {
    this.pk = props.pk;
    this.sk = props.sk;
    this.prefix = props.prefix;
    this.suffix = props.suffix;
  }

  public static async get<M extends typeof Model>(this: M, primaryKey: SimpleKey): Promise<InstanceType<M>>;
  public static async get<M extends typeof Model>(this: M, primaryKey: CompositeKey): Promise<InstanceType<M>>;
  public static async get<M extends typeof Model>(
    this: M,
    primaryKey: SimpleKey | CompositeKey,
  ): Promise<InstanceType<M>> {
    await this.table.wait();
    const result = await this.ddb.getItem({
      TableName: this.table.name,
      Key: objectToDynamo(convertPrimaryKey(primaryKey, this.table)),
    });

    if (!result || !result.Item) {
      throw new error.NotFoundError();
    }

    const item = fromDynamo(result.Item || {});
    return this.parse(this, item);
  }

  public static async update<M extends typeof Model>(this: M, primaryKey: SimpleKey, props: ChildProps<M>): Promise<InstanceType<M>>; // prettier-ignore
  public static async update<M extends typeof Model>(this: M, primaryKey: CompositeKey, props: ChildProps<M>): Promise<InstanceType<M>>; // prettier-ignore
  public static async update<M extends typeof Model>(
    this: M,
    primaryKey: SimpleKey | CompositeKey,
    props: ChildProps<M>,
  ): Promise<InstanceType<M>> {
    await this.table.wait();
    const result = await this.ddb.updateItem({
      TableName: this.table.name,
      Key: objectToDynamo(convertPrimaryKey(primaryKey, this.table)),
      ReturnValues: 'ALL_NEW',
      //TODO: implement better querying!!!
      UpdateExpression: `set ${Object.entries(props)
        .map(([key]) => `${key} = :${key}`)
        .join(', ')}`,
      ExpressionAttributeValues: objectToDynamo({
        ...Object.fromEntries(Object.entries(props).map(([key, value]) => [`:${key}`, value])),
      }),
    });

    const item = fromDynamo(result.Attributes || {});
    return this.parse(this, item);
  }

  public static async put<M extends typeof Model>(this: M, item: InstanceType<M>): Promise<InstanceType<M>> {
    await this.table.wait();
    await this.ddb.putItem({
      TableName: this.table.name,
      Item: modelToDynamo({ ...item }, this.table),
    });

    return item;
  }

  private static parse<M extends typeof Model>(Class: M, item: GenericObject): InstanceType<M> {
    const { primaryKey } = this.table;

    return new Class({
      ...(item as any),
      pk: item[primaryKey.pk],
      sk: 'sk' in primaryKey ? item[primaryKey.sk] : undefined,
    }) as InstanceType<M>;
  }
}
