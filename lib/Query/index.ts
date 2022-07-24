import { DynamoDB, QueryInput } from '@aws-sdk/client-dynamodb';
import { Model } from '../Model';
import { Table } from '../Table';

export interface QueryOptions {
  index: any;
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

  public async exec() {
    const result = await this.ddb.query(this.queryInput);
    const items = result.Items || [];

    return {
      items: items.map((item) => this.Class.parseFromDynamo(this.Class, item)),
      count: result.Count || 0,
    };
  }

  public async limit(count: number) {
    this.queryInput.Limit = count;
  }
}
