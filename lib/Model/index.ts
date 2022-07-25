import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { convertPrimaryKey, fromDynamo, GenericObject, modelToDynamo, NotFoundError, objectToDynamo } from '@lib/utils';
import { Query, QueryOptions } from '@Query/index';
import { Table } from '@Table/index';
import { CompositeKey, SimpleKey } from '@Table/types';

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

  public static query<M extends typeof Model>(this: M, options: QueryOptions) {
    return new Query(this, options);
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
      throw new NotFoundError();
    }

    const item = fromDynamo(result.Item || {});
    return this.parseFromDynamo(this, item);
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
    return this.parseFromDynamo(this, item);
  }

  public static async put<M extends typeof Model>(this: M, item: InstanceType<M>): Promise<InstanceType<M>> {
    await this.table.wait();
    await this.ddb.putItem({
      TableName: this.table.name,
      Item: modelToDynamo({ ...item }, this.table),
    });

    return item;
  }

  public static async delete<M extends typeof Model>(this: M, primaryKey: SimpleKey): Promise<void>;
  public static async delete<M extends typeof Model>(this: M, primaryKey: CompositeKey): Promise<void>;
  public static async delete<M extends typeof Model>(this: M, primaryKey: SimpleKey | CompositeKey): Promise<void> {
    await this.table.wait();
    await this.ddb.deleteItem({
      TableName: this.table.name,
      Key: objectToDynamo(convertPrimaryKey(primaryKey, this.table)),
    });
  }

  public static parseFromDynamo<M extends typeof Model>(Class: M, item: GenericObject): InstanceType<M> {
    const { primaryKey } = this.table;

    return new Class({
      //TODO: get rid of real primary key here
      ...(item as any),
      pk: item[primaryKey.pk],
      sk: 'sk' in primaryKey ? item[primaryKey.sk] : undefined,
    }) as InstanceType<M>;
  }
}
