import { DynamoDB, QueryInput } from '@aws-sdk/client-dynamodb';
import { Condition } from '@lib/Condition';
import { AttributeType } from '@lib/Condition/types';
import { Model } from '@lib/Model';
import { Table } from '@lib/Table';
import { AttributeMap, checkDuplicatesInArray, DefaultError, GenericObject, isEmpty, objectToDynamo } from '@lib/utils';
import { substituteAttribute, substituteAttributeName, substituteAttributeValue } from '@lib/utils/substitute';
import { Keys, PartitionKeys } from '@lib/utils/symbols';
import { SortKeys } from '@lib/utils/symbols';
import { FilterQueryCondition, KeyQueryCondition, QueryOptions } from '@Query/types';

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

  private attributeNames: Record<string, string>;
  private attributeValues: AttributeMap;

  constructor(model: M, key: PartitionKeys, value: string | number) {
    this.table = model.table;
    this.ddb = model.ddb;
    this.Class = model;

    this.orBetweenCondition = false;
    this.attributeNames = {};
    this.attributeValues = {};
    this.keys = [key];
    this.filterConditions = [];

    const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, this.table[key], value);
    this.keyConditions = [`${k} = ${v}`];

    this.queryInput = {
      TableName: this.table.tableName,
    };
  }

  public async exec(options?: QueryOptions) {
    this.buildQueryInput(options?.queryInput);
    this.validateQueryInput();
    const result = await this.ddb.query(this.queryInput);
    const items = result.Items || [];

    return {
      items: items.map((item) => this.Class.parseFromDynamo(this.Class, item)),
      count: result.Count || 0,
    };
  }

  public debug() {
    this.buildQueryInput();
    return this.queryInput;
  }

  private buildQueryInput(queryInput?: Partial<QueryInput>) {
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

    if (!isEmpty(this.attributeNames)) {
      this.queryInput.ExpressionAttributeNames = this.attributeNames;
    }

    if (!isEmpty(this.attributeValues)) {
      this.queryInput.ExpressionAttributeValues = this.attributeValues;
    }

    this.queryInput = { ...this.queryInput, ...queryInput };
  }

  //TODO: Implement validation
  private validateQueryInput() {
    console.log('validateQueryInput');
  }

  public sortKey(key: SortKeys): KeyQueryCondition {
    this.keyConditions.push(`AND`);

    return {
      eq: (value: string | number) => this._eq(this.keyConditions, this.table[key], value),
      ne: (value: string | number) => this._ne(this.keyConditions, this.table[key], value),
      lt: (value: string | number) => this._lt(this.keyConditions, this.table[key], value),
      le: (value: string | number) => this._le(this.keyConditions, this.table[key], value),
      gt: (value: string | number) => this._gt(this.keyConditions, this.table[key], value),
      ge: (value: string | number) => this._ge(this.keyConditions, this.table[key], value),
      beginsWith: (value: string | number) => this._beginsWith(this.keyConditions, this.table[key], value),
      between: (value1: string | number, value2: string | number) =>
        this._between(this.keyConditions, this.table[key], value1, value2),
    };
  }

  public filter(key: string): FilterQueryCondition {
    if (this.filterConditions.length > 0) {
      this.filterConditions.push(`${this.orBetweenCondition ? 'OR' : 'AND'}`);
    }
    this.orBetweenCondition = false;

    return {
      eq: (value: string | number): QueryInstance => this._eq(this.filterConditions, key, value),
      ne: (value: string | number): QueryInstance => this._ne(this.filterConditions, key, value),
      lt: (value: string | number): QueryInstance => this._lt(this.filterConditions, key, value),
      le: (value: string | number): QueryInstance => this._le(this.filterConditions, key, value),
      gt: (value: string | number): QueryInstance => this._gt(this.filterConditions, key, value),
      ge: (value: string | number): QueryInstance => this._ge(this.filterConditions, key, value),
      beginsWith: (value: string | number): QueryInstance => this._beginsWith(this.filterConditions, key, value),
      between: (value1: string | number, value2: string | number): QueryInstance =>
        this._between(this.filterConditions, key, value1, value2),
      contains: (value: string | number): QueryInstance => {
        const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
        this.filterConditions.push(`contains(${k}, ${v})`);
        return this;
      },
      in: (values: string[]): QueryInstance => {
        const k = substituteAttributeName(this.attributeNames, key);
        this.filterConditions.push(
          `${k} IN ${values.map((v) => substituteAttributeValue(this.attributeValues, key, v)).join(', ')}`,
        );
        return this;
      },
      type: (value: AttributeType): QueryInstance => {
        const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
        this.filterConditions.push(`attribute_type(${k}, ${v})`);
        return this;
      },
      exists: (): QueryInstance => {
        const k = substituteAttributeName(this.attributeNames, key);
        this.filterConditions.push(`attribute_exists(${k})`);
        return this;
      },
      size: () => {
        const k = substituteAttributeName(this.attributeNames, key);
        return {
          eq: (value: string | number): QueryInstance => this._eq(this.filterConditions, `size(${k})`, value, false),
          ne: (value: string | number): QueryInstance => this._ne(this.filterConditions, `size(${k})`, value, false),
          lt: (value: string | number): QueryInstance => this._lt(this.filterConditions, `size(${k})`, value, false),
          le: (value: string | number): QueryInstance => this._le(this.filterConditions, `size(${k})`, value, false),
          gt: (value: string | number): QueryInstance => this._gt(this.filterConditions, `size(${k})`, value, false),
          ge: (value: string | number): QueryInstance => this._ge(this.filterConditions, `size(${k})`, value, false),
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
            const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
            this.filterConditions.push(`NOT contains(${k}, ${v})`);
            return this;
          },
          in: (values: string[]): QueryInstance => {
            const k = substituteAttributeName(this.attributeNames, key);
            this.filterConditions.push(
              `NOT (${k} IN ${values.map((v) => substituteAttributeValue(this.attributeValues, key, v)).join(', ')})`,
            );
            return this;
          },
          exists: (): QueryInstance => {
            const k = substituteAttributeName(this.attributeNames, key);
            this.filterConditions.push(`attribute_not_exists(${k})`);
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

  private _eq(conditions: string[], key: string, value: string | number, substituteKey = true): QueryInstance {
    const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
    conditions.push(`${substituteKey ? k : key} = ${v}`);
    return this;
  }

  private _ne(conditions: string[], key: string, value: string | number, substituteKey = true): QueryInstance {
    const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
    conditions.push(`${substituteKey ? k : key} <> ${v}`);
    return this;
  }

  private _lt(conditions: string[], key: string, value: string | number, substituteKey = true): QueryInstance {
    const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
    conditions.push(`${substituteKey ? k : key} < ${v}`);
    return this;
  }

  private _le(conditions: string[], key: string, value: string | number, substituteKey = true): QueryInstance {
    const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
    conditions.push(`${substituteKey ? k : key} <= ${v}`);
    return this;
  }

  private _gt(conditions: string[], key: string, value: string | number, substituteKey = true): QueryInstance {
    const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
    conditions.push(`${substituteKey ? k : key} > ${v}`);
    return this;
  }

  private _ge(conditions: string[], key: string, value: string | number, substituteKey = true): QueryInstance {
    const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
    conditions.push(`${substituteKey ? k : key} >= ${v}`);
    return this;
  }

  private _beginsWith(conditions: string[], key: string, value: string | number): QueryInstance {
    const { k, v } = substituteAttribute(this.attributeNames, this.attributeValues, key, value);
    conditions.push(`begins_with(${k}, ${v})`);
    return this;
  }

  private _between(conditions: string[], key: string, value1: string | number, value2: string | number): QueryInstance {
    const { k, v: v1 } = substituteAttribute(this.attributeNames, this.attributeValues, key, value1);
    const v2 = substituteAttributeValue(this.attributeValues, key, value2);
    conditions.push(`${k} BETWEEN ${v1} AND ${v2}`);
    return this;
  }
}
