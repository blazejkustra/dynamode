import { DynamoDB, QueryInput } from '@aws-sdk/client-dynamodb';
import { checkDuplicatesInArray, DefaultError, GenericObject, NonFunctionProperties, objectToDynamo } from '@lib/utils';
import { Model } from '@Model/index';
import { Table } from '@Table/index';

export interface QueryOptions {
  index: unknown;
}

export class Query<M extends typeof Model> {
  private table: Table;
  private ddb: DynamoDB;
  private Class: M;
  private options: QueryOptions;

  private queryInput: QueryInput;

  constructor(model: M, options: QueryOptions) {
    this.table = model.table;
    this.ddb = model.ddb;
    this.Class = model;
    this.options = options;

    this.queryInput = {
      TableName: this.table.name,
    };
  }

  get input() {
    return this.queryInput;
  }

  public async exec() {
    const result = await this.ddb.query(this.queryInput);
    const items = result.Items || [];

    return {
      items: items.map((item) => this.Class.parseFromDynamo(this.Class, item)),
      count: result.Count || 0,
    };
  }

  public limit(count: number) {
    this.queryInput.Limit = count;
    return this;
  }

  public startAt(key: GenericObject) {
    this.queryInput.ExclusiveStartKey = objectToDynamo(key);
    return this;
  }

  public sort(order: 'ascending' | 'descending') {
    this.queryInput.ScanIndexForward = order === 'ascending';
    return this;
  }

  public consistent() {
    this.queryInput.ConsistentRead = true;
    return this;
  }

  public count() {
    this.queryInput.Select = 'COUNT';
    return this;
  }

  public attributes(attributes: NonFunctionProperties<InstanceType<M>>[]) {
    if (checkDuplicatesInArray(attributes)) {
      throw new DefaultError();
    }

    this.queryInput.ProjectionExpression = attributes.join(', ');
    return this;
  }
}
