import { Class } from 'type-fest';

import { DynamoDB, QueryCommandOutput, QueryInput } from '@aws-sdk/client-dynamodb';
import { Condition } from '@lib/Condition';
import { AttributeType } from '@lib/Condition/types';
import { EntityKeys } from '@lib/Entity/types';
import { BuildQueryConditionExpression, QueryExecOptions, QueryExecOutput } from '@lib/Query/types';
import { AttributeMap, buildExpression, checkDuplicatesInArray, ConditionExpression, DefaultError, GenericObject, isEmpty, objectToDynamo } from '@lib/utils';

export class Query<T extends Class<unknown> & { ddb: DynamoDB; tableName: string }> {
  private ddb: DynamoDB;

  private queryInput: QueryInput;
  private keyConditions: ConditionExpression[] = [];
  private filterConditions: ConditionExpression[] = [];
  private keys: Array<keyof EntityKeys<T>> = [];
  private orBetweenCondition = false;

  constructor(entity: T, key: keyof EntityKeys<T>, value: string | number) {
    this.ddb = entity.ddb;

    this.keys.push(key);
    this._eq(this.keyConditions, String(key), value);

    this.queryInput = {
      TableName: entity.tableName,
    };
  }

  public exec(): Promise<QueryExecOutput<T>>;
  public exec(options: Omit<QueryExecOptions, 'return'>): Promise<QueryExecOutput<T>>;
  public exec(options: QueryExecOptions & { return: 'default' }): Promise<QueryExecOutput<T>>;
  public exec(options: QueryExecOptions & { return: 'output' }): Promise<QueryCommandOutput>;
  public exec(options: QueryExecOptions & { return: 'input' }): QueryInput;
  public exec(options?: QueryExecOptions): Promise<QueryExecOutput<T> | QueryCommandOutput> | QueryInput {
    this.buildQueryInput(options?.extraInput);
    this.validateQueryInput();

    if (options?.return === 'input') {
      return this.queryInput;
    }

    return (async () => {
      const result = await this.ddb.query(this.queryInput);

      if (options?.return === 'output') {
        return result;
      }

      const items = result.Items || [];

      return {
        items: [], //items.map((item) => this.Class.parseFromDynamo(item)),
        count: result.Count || 0,
      };
    })();
  }

  private buildQueryInput(queryInput?: Partial<QueryInput>) {
    const { conditionExpression, keyConditionExpression, attributeNames, attributeValues } = this.buildQueryConditionExpression();

    if (keyConditionExpression) {
      this.queryInput.KeyConditionExpression = keyConditionExpression;
    }

    if (conditionExpression) {
      this.queryInput.FilterExpression = conditionExpression;
    }

    if (!isEmpty(attributeNames)) {
      this.queryInput.ExpressionAttributeNames = attributeNames;
    }

    if (!isEmpty(attributeValues)) {
      this.queryInput.ExpressionAttributeValues = attributeValues;
    }

    // const indexName = this.table.getIndexName(this.keys[this.keys.length - 1]);
    // if (indexName) {
    //   this.queryInput.IndexName = indexName;
    // }

    this.queryInput = { ...this.queryInput, ...queryInput };
  }

  //TODO: Implement validation
  private validateQueryInput() {
    // ValidationException: Invalid FilterExpression: The BETWEEN operator requires upper bound to be greater than or equal to lower bound; lower bound operand: AttributeValue: {S:5}, upper bound operand: AttributeValue: {S:100}
    // Index validation
    console.log('validateQueryInput');
  }

  public sortKey(key: keyof EntityKeys<T>) {
    this.keyConditions.push({ expr: 'AND' });

    return {
      eq: (value: string | number) => this._eq(this.keyConditions, String(key), value),
      ne: (value: string | number) => this._ne(this.keyConditions, String(key), value),
      lt: (value: string | number) => this._lt(this.keyConditions, String(key), value),
      le: (value: string | number) => this._le(this.keyConditions, String(key), value),
      gt: (value: string | number) => this._gt(this.keyConditions, String(key), value),
      ge: (value: string | number) => this._ge(this.keyConditions, String(key), value),
      beginsWith: (value: string | number) => this._beginsWith(this.keyConditions, String(key), value),
      between: (value1: string | number, value2: string | number) => this._between(this.keyConditions, String(key), value1, value2),
    };
  }

  public filter(key: keyof EntityKeys<T>) {
    if (this.filterConditions.length > 0) {
      this.filterConditions.push({ expr: this.orBetweenCondition ? 'OR' : 'AND' });
    }
    this.orBetweenCondition = false;

    return {
      eq: (value: string | number): Query<T> => this._eq(this.filterConditions, String(key), value),
      ne: (value: string | number): Query<T> => this._ne(this.filterConditions, String(key), value),
      lt: (value: string | number): Query<T> => this._lt(this.filterConditions, String(key), value),
      le: (value: string | number): Query<T> => this._le(this.filterConditions, String(key), value),
      gt: (value: string | number): Query<T> => this._gt(this.filterConditions, String(key), value),
      ge: (value: string | number): Query<T> => this._ge(this.filterConditions, String(key), value),
      beginsWith: (value: string | number): Query<T> => this._beginsWith(this.filterConditions, String(key), value),
      between: (value1: string | number, value2: string | number): Query<T> => this._between(this.filterConditions, String(key), value1, value2),
      contains: (value: string | number): Query<T> => {
        this.filterConditions.push({ keys: [String(key)], values: [value], expr: `contains($K, $V)` });
        return this;
      },
      in: (values: string[]): Query<T> => {
        this.filterConditions.push({ keys: [String(key)], values, expr: `$K IN ${values.map(() => '$V').join(', ')}` });
        return this;
      },
      type: (value: AttributeType): Query<T> => {
        this.filterConditions.push({ keys: [String(key)], values: [value], expr: 'attribute_type($K, $V)' });
        return this;
      },
      exists: (): Query<T> => {
        this.filterConditions.push({ keys: [String(key)], expr: 'attribute_exists($K)' });
        return this;
      },
      size: () => ({
        eq: (value: string | number): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [value], expr: 'size($K) = $V' });
          return this;
        },
        ne: (value: string | number): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [value], expr: 'size($K) <> $V' });
          return this;
        },
        lt: (value: string | number): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [value], expr: 'size($K) < $V' });
          return this;
        },
        le: (value: string | number): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [value], expr: 'size($K) <= $V' });
          return this;
        },
        gt: (value: string | number): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [value], expr: 'size($K) > $V' });
          return this;
        },
        ge: (value: string | number): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [value], expr: 'size($K) >= $V' });
          return this;
        },
      }),
      not: () => ({
        eq: (value: string | number): Query<T> => this._ne(this.filterConditions, String(key), value),
        ne: (value: string | number): Query<T> => this._eq(this.filterConditions, String(key), value),
        lt: (value: string | number): Query<T> => this._ge(this.filterConditions, String(key), value),
        le: (value: string | number): Query<T> => this._gt(this.filterConditions, String(key), value),
        gt: (value: string | number): Query<T> => this._le(this.filterConditions, String(key), value),
        ge: (value: string | number): Query<T> => this._lt(this.filterConditions, String(key), value),
        contains: (value: string | number): Query<T> => {
          this.filterConditions.push({
            keys: [String(key)],
            values: [value],
            expr: `NOT contains($K, $V)`,
          });
          return this;
        },
        in: (values: string[]): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values, expr: `NOT ($K IN ${values.map(() => '$V').join(', ')})` });
          return this;
        },
        exists: (): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], expr: 'attribute_not_exists($K)' });
          return this;
        },
      }),
    };
  }

  public get and() {
    return this;
  }

  public get or() {
    this.orBetweenCondition = true;
    return this;
  }

  public parenthesis(condition?: Condition<T>) {
    if (condition) {
      if (this.filterConditions.length > 0) {
        this.filterConditions.push({ expr: this.orBetweenCondition ? 'OR' : 'AND' });
      }
      this.orBetweenCondition = false;
      this.filterConditions.push(...[{ expr: '(' }, ...condition.conditions, { expr: ')' }]);
    }
    return this;
  }

  public group(condition?: Condition<T>) {
    return this.parenthesis(condition);
  }

  public condition(condition?: Condition<T>) {
    if (condition) {
      if (this.filterConditions.length > 0) {
        this.filterConditions.push({ expr: this.orBetweenCondition ? 'OR' : 'AND' });
      }
      this.orBetweenCondition = false;
      this.filterConditions.push(...condition.conditions);
    }
    return this;
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

  private _eq(conditions: ConditionExpression[], key: string, value: string | number): Query<T> {
    conditions.push({ keys: [key], values: [value], expr: '$K = $V' });
    return this;
  }

  private _ne(conditions: ConditionExpression[], key: string, value: string | number): Query<T> {
    conditions.push({ keys: [key], values: [value], expr: '$K = $V' });
    return this;
  }

  private _lt(conditions: ConditionExpression[], key: string, value: string | number): Query<T> {
    conditions.push({ keys: [key], values: [value], expr: '$K < $V' });
    return this;
  }

  private _le(conditions: ConditionExpression[], key: string, value: string | number): Query<T> {
    conditions.push({ keys: [key], values: [value], expr: '$K <= $V' });
    return this;
  }

  private _gt(conditions: ConditionExpression[], key: string, value: string | number): Query<T> {
    conditions.push({ keys: [key], values: [value], expr: '$K > $V' });
    return this;
  }

  private _ge(conditions: ConditionExpression[], key: string, value: string | number): Query<T> {
    conditions.push({ keys: [key], values: [value], expr: '$K >= $V' });
    return this;
  }

  private _beginsWith(conditions: ConditionExpression[], key: string, value: string | number): Query<T> {
    conditions.push({ keys: [key], values: [value], expr: 'begins_with($K, $V)' });
    return this;
  }

  private _between(conditions: ConditionExpression[], key: string, v1: string | number, v2: string | number): Query<T> {
    conditions.push({ keys: [key], values: [v1, v2], expr: '$K BETWEEN $V AND $V' });
    return this;
  }

  private buildQueryConditionExpression(): BuildQueryConditionExpression {
    const attributeNames: Record<string, string> = {};
    const attributeValues: AttributeMap = {};

    return {
      attributeNames,
      attributeValues,
      conditionExpression: buildExpression(this.filterConditions, attributeNames, attributeValues),
      keyConditionExpression: buildExpression(this.keyConditions, attributeNames, attributeValues),
    };
  }
}
