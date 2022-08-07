import { DynamoDB, QueryInput } from '@aws-sdk/client-dynamodb';
import { Condition } from '@lib/Condition';
import { AttributeType } from '@lib/Condition/types';
import { Model } from '@lib/Model';
import { Table } from '@lib/Table';
import { checkDuplicatesInArray, DefaultError, GenericObject, objectToDynamo } from '@lib/utils';
import { Keys, PartitionKeys } from '@lib/utils/symbols';
import { SortKeys } from '@lib/utils/symbols';
import { FilterQueryCondition, KeyQueryCondition } from '@Query/types';

export interface QueryOptions {
  queryInput?: QueryInput;
}

type QueryInstance = InstanceType<typeof Query>;

export class Query<M extends typeof Model = typeof Model> {
  private table: typeof Table;
  private ddb: DynamoDB;
  private Class: M;

  private queryInput: QueryInput;
  private keyConditions: string[];
  private filterConditions: string[];
  private keys: Keys[];
  private orBetweenCondition: boolean;

  constructor(model: M, key: PartitionKeys, value: string | number) {
    this.table = model.table;
    this.ddb = model.ddb;
    this.Class = model;

    this.keys = [key];
    this.keyConditions = [`${this.table[key]} = ${value}`];
    this.filterConditions = [];
    this.orBetweenCondition = false;

    this.queryInput = {
      TableName: this.table.tableName,
    };
  }

  public async exec(options: QueryOptions) {
    this.buildQueryInput(options.queryInput);
    this.validateQueryInput();
    const result = await this.ddb.query(this.queryInput);
    // const items = result.Items || [];

    return {
      items: [], //items.map((item) => this.Class.parseFromDynamo(this.Class, item)),
      count: result.Count || 0,
    };
  }

  public debug() {
    this.buildQueryInput();
    return this.queryInput;
  }

  private buildQueryInput(queryInput?: QueryInput) {
    const keyConditions = this.keyConditions.join(' ');
    if (keyConditions) {
      this.queryInput.KeyConditionExpression = keyConditions;
    }

    const filterConditions = this.filterConditions.join(' ');
    if (filterConditions) {
      this.queryInput.FilterExpression = filterConditions;
    }

    const indexName = this.table.getIndexName(this.keys[this.keys.length - 1]);
    if (indexName) {
      this.queryInput.IndexName = indexName;
    }

    this.queryInput = { ...this.queryInput, ...queryInput };
  }

  private validateQueryInput() {
    console.log('validateQueryInput');
  }

  public sortKey(key: SortKeys): KeyQueryCondition {
    this.keyConditions.push(`AND`);

    return {
      eq: (value: string | number) => {
        return this._eq(this.keyConditions, this.table[key], value);
      },
      ne: (value: string | number) => {
        return this._ne(this.keyConditions, this.table[key], value);
      },
      lt: (value: string | number) => {
        return this._lt(this.keyConditions, this.table[key], value);
      },
      le: (value: string | number) => {
        return this._le(this.keyConditions, this.table[key], value);
      },
      gt: (value: string | number) => {
        return this._gt(this.keyConditions, this.table[key], value);
      },
      ge: (value: string | number) => {
        return this._ge(this.keyConditions, this.table[key], value);
      },
      beginsWith: (value: string | number) => {
        return this._beginsWith(this.keyConditions, this.table[key], value);
      },
      between: (value1: string | number, value2: string | number) => {
        return this._between(this.keyConditions, this.table[key], value1, value2);
      },
    };
  }

  public filter(key: string | number): FilterQueryCondition {
    if (this.filterConditions.length > 0) {
      this.filterConditions.push(`${this.orBetweenCondition ? 'OR' : 'AND'}`);
    }
    this.orBetweenCondition = false;

    return {
      eq: (value: string | number): QueryInstance => {
        return this._eq(this.filterConditions, key, value);
      },
      ne: (value: string | number): QueryInstance => {
        return this._ne(this.filterConditions, key, value);
      },
      lt: (value: string | number): QueryInstance => {
        return this._lt(this.filterConditions, key, value);
      },
      le: (value: string | number): QueryInstance => {
        return this._le(this.filterConditions, key, value);
      },
      gt: (value: string | number): QueryInstance => {
        return this._gt(this.filterConditions, key, value);
      },
      ge: (value: string | number): QueryInstance => {
        return this._ge(this.filterConditions, key, value);
      },
      beginsWith: (value: string | number): QueryInstance => {
        return this._beginsWith(this.filterConditions, key, value);
      },
      between: (value1: string | number, value2: string | number): QueryInstance => {
        return this._between(this.filterConditions, key, value1, value2);
      },
      contains: (value: string | number): QueryInstance => {
        this.filterConditions.push(`contains(${key}, ${value})`);
        return this;
      },
      in: (values: string[]): QueryInstance => {
        this.filterConditions.push(`${key} IN ${values.join(', ')}`);
        return this;
      },
      type: (value: AttributeType): QueryInstance => {
        this.filterConditions.push(`attribute_type(${key}, ${value})`);
        return this;
      },
      exists: (): QueryInstance => {
        this.filterConditions.push(`attribute_exists(${key})`);
        return this;
      },
      size: () => {
        return {
          eq: (value: string | number): QueryInstance => this._eq(this.filterConditions, `size(${key})`, value),
          ne: (value: string | number): QueryInstance => this._ne(this.filterConditions, `size(${key})`, value),
          lt: (value: string | number): QueryInstance => this._lt(this.filterConditions, `size(${key})`, value),
          le: (value: string | number): QueryInstance => this._le(this.filterConditions, `size(${key})`, value),
          gt: (value: string | number): QueryInstance => this._gt(this.filterConditions, `size(${key})`, value),
          ge: (value: string | number): QueryInstance => this._ge(this.filterConditions, `size(${key})`, value),
        };
      },
      not: () => {
        return {
          eq: (value: string | number): QueryInstance => this._ne(this.filterConditions, key, value),
          ne: (value: string | number): QueryInstance => this._eq(this.filterConditions, key, value),
          lt: (value: string | number): QueryInstance => this._ge(this.filterConditions, key, value),
          le: (value: string | number): QueryInstance => this._gt(this.filterConditions, key, value),
          gt: (value: string | number): QueryInstance => this._le(this.filterConditions, key, value),
          ge: (value: string | number): QueryInstance => this._lt(this.filterConditions, key, value),
          contains: (value: string | number): QueryInstance => {
            this.filterConditions.push(`NOT contains(${key}, ${value})`);
            return this;
          },
          in: (values: string[]): QueryInstance => {
            this.filterConditions.push(`NOT (${key} IN ${values.join(', ')})`);
            return this;
          },
          exists: (): QueryInstance => {
            this.filterConditions.push(`attribute_not_exists(${key})`);
            return this;
          },
        };
      },
    };
  }

  public get and() {
    return this;
  }

  public get or() {
    this.orBetweenCondition = true;
    return this;
  }

  public parenthesis(condition: InstanceType<typeof Condition>) {
    if (this.filterConditions.length > 0) {
      this.filterConditions.push(`${this.orBetweenCondition ? 'OR' : 'AND'}`);
    }
    this.orBetweenCondition = false;
    this.filterConditions.push(...['(', ...condition.conditions, ')']);
    return this;
  }

  public group(condition: InstanceType<typeof Condition>) {
    return this.parenthesis(condition);
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

  public attributes(attributes: string[]) {
    if (checkDuplicatesInArray(attributes)) {
      throw new DefaultError();
    }

    this.queryInput.ProjectionExpression = attributes.join(', ');
    return this;
  }

  private _eq(conditions: string[], key: string | number, value: string | number): QueryInstance {
    conditions.push(`${key} = ${value}`);
    return this;
  }

  private _ne(conditions: string[], key: string | number, value: string | number): QueryInstance {
    conditions.push(`${key} <> ${value}`);
    return this;
  }

  private _lt(conditions: string[], key: string | number, value: string | number): QueryInstance {
    conditions.push(`${key} < ${value}`);
    return this;
  }

  private _le(conditions: string[], key: string | number, value: string | number): QueryInstance {
    conditions.push(`${key} <= ${value}`);
    return this;
  }

  private _gt(conditions: string[], key: string | number, value: string | number): QueryInstance {
    conditions.push(`${key} > ${value}`);
    return this;
  }

  private _ge(conditions: string[], key: string | number, value: string | number): QueryInstance {
    conditions.push(`${key} >= ${value}`);
    return this;
  }

  private _beginsWith(conditions: string[], key: string | number, value: string | number): QueryInstance {
    conditions.push(`begins_with(${key}, ${value})`);
    return this;
  }

  private _between(
    conditions: string[],
    key: string | number,
    value1: string | number,
    value2: string | number,
  ): QueryInstance {
    conditions.push(`${key} BETWEEN ${value1} AND ${value2}`);
    return this;
  }
}
