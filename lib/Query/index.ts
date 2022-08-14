import { DynamoDB, QueryCommandOutput, QueryInput } from '@aws-sdk/client-dynamodb';
import { ConditionInstance } from '@lib/Condition';
import { AttributeType } from '@lib/Condition/types';
import { Model } from '@lib/Model';
import { Table } from '@lib/Table';
import { checkDuplicatesInArray, DefaultError, GenericObject, isEmpty, objectToDynamo } from '@lib/utils';
import { ConditionExpression, substituteQueryConditions } from '@lib/utils/substituteConditions';
import { Keys, PartitionKeys } from '@lib/utils/symbols';
import { SortKeys } from '@lib/utils/symbols';
import { FilterQueryCondition, KeyQueryCondition, QueryExecOptions, QueryExecOutput } from '@Query/types';

type QueryInstance<M extends typeof Model> = InstanceType<typeof Query<M>>;

export class Query<M extends typeof Model> {
  private table: typeof Table;
  private ddb: DynamoDB;
  private Class: M;

  private queryInput: QueryInput;
  private keyConditions: ConditionExpression[];
  private filterConditions: ConditionExpression[];
  private keys: Keys[];
  private orBetweenCondition: boolean;

  constructor(model: M, key: PartitionKeys, value: string | number) {
    this.table = model.table;
    this.ddb = model.ddb;
    this.Class = model;

    this.orBetweenCondition = false;
    this.keys = [key];
    this.filterConditions = [];
    this.keyConditions = [];
    this._eq(this.keyConditions, this.table[key], value);

    this.queryInput = {
      TableName: this.table.tableName,
    };
  }

  public exec(): Promise<QueryExecOutput<M>>;
  public exec(options: Omit<QueryExecOptions, 'return'>): Promise<QueryExecOutput<M>>;
  public exec(options: QueryExecOptions & { return: 'default' }): Promise<QueryExecOutput<M>>;
  public exec(options: QueryExecOptions & { return: 'output' }): Promise<QueryCommandOutput>;
  public exec(options: QueryExecOptions & { return: 'input' }): QueryInput;
  public exec(options?: QueryExecOptions): Promise<QueryExecOutput<M> | QueryCommandOutput> | QueryInput {
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
        items: items.map((item) => this.Class.parseFromDynamo(item)),
        count: result.Count || 0,
      };
    })();
  }

  private buildQueryInput(queryInput?: Partial<QueryInput>) {
    const { conditionExpression, keyConditionExpression, attributeNames, attributeValues } = substituteQueryConditions(this.filterConditions, this.keyConditions);

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

    const indexName = this.table.getIndexName(this.keys[this.keys.length - 1]);
    if (indexName) {
      this.queryInput.IndexName = indexName;
    }

    this.queryInput = { ...this.queryInput, ...queryInput };
  }

  //TODO: Implement validation
  private validateQueryInput() {
    // ValidationException: Invalid FilterExpression: The BETWEEN operator requires upper bound to be greater than or equal to lower bound; lower bound operand: AttributeValue: {S:5}, upper bound operand: AttributeValue: {S:100}
    // Index validation
    console.log('validateQueryInput');
  }

  public sortKey(key: SortKeys): KeyQueryCondition<M> {
    this.keyConditions.push({ expr: 'AND' });

    return {
      eq: (value: string | number) => this._eq(this.keyConditions, this.table[key], value),
      ne: (value: string | number) => this._ne(this.keyConditions, this.table[key], value),
      lt: (value: string | number) => this._lt(this.keyConditions, this.table[key], value),
      le: (value: string | number) => this._le(this.keyConditions, this.table[key], value),
      gt: (value: string | number) => this._gt(this.keyConditions, this.table[key], value),
      ge: (value: string | number) => this._ge(this.keyConditions, this.table[key], value),
      beginsWith: (value: string | number) => this._beginsWith(this.keyConditions, this.table[key], value),
      between: (value1: string | number, value2: string | number) => this._between(this.keyConditions, this.table[key], value1, value2),
    };
  }

  public filter(key: string): FilterQueryCondition<M> {
    if (this.filterConditions.length > 0) {
      this.filterConditions.push({ expr: this.orBetweenCondition ? 'OR' : 'AND' });
    }
    this.orBetweenCondition = false;

    return {
      eq: (value: string | number): QueryInstance<M> => this._eq(this.filterConditions, key, value),
      ne: (value: string | number): QueryInstance<M> => this._ne(this.filterConditions, key, value),
      lt: (value: string | number): QueryInstance<M> => this._lt(this.filterConditions, key, value),
      le: (value: string | number): QueryInstance<M> => this._le(this.filterConditions, key, value),
      gt: (value: string | number): QueryInstance<M> => this._gt(this.filterConditions, key, value),
      ge: (value: string | number): QueryInstance<M> => this._ge(this.filterConditions, key, value),
      beginsWith: (value: string | number): QueryInstance<M> => this._beginsWith(this.filterConditions, key, value),
      between: (value1: string | number, value2: string | number): QueryInstance<M> => this._between(this.filterConditions, key, value1, value2),
      contains: (value: string | number): QueryInstance<M> => {
        this.filterConditions.push({ keys: [key], values: [value], expr: `contains($K, $V)` });
        return this;
      },
      in: (values: string[]): QueryInstance<M> => {
        this.filterConditions.push({ keys: [key], values, expr: `$K IN ${values.map(() => '$V').join(', ')}` });
        return this;
      },
      type: (value: AttributeType): QueryInstance<M> => {
        this.filterConditions.push({ keys: [key], values: [value], expr: 'attribute_type($K, $V)' });
        return this;
      },
      exists: (): QueryInstance<M> => {
        this.filterConditions.push({ keys: [key], expr: 'attribute_exists($K)' });
        return this;
      },
      size: () => ({
        eq: (value: string | number): QueryInstance<M> => {
          this.filterConditions.push({ keys: [key], values: [value], expr: 'size($K) = $V' });
          return this;
        },
        ne: (value: string | number): QueryInstance<M> => {
          this.filterConditions.push({ keys: [key], values: [value], expr: 'size($K) <> $V' });
          return this;
        },
        lt: (value: string | number): QueryInstance<M> => {
          this.filterConditions.push({ keys: [key], values: [value], expr: 'size($K) < $V' });
          return this;
        },
        le: (value: string | number): QueryInstance<M> => {
          this.filterConditions.push({ keys: [key], values: [value], expr: 'size($K) <= $V' });
          return this;
        },
        gt: (value: string | number): QueryInstance<M> => {
          this.filterConditions.push({ keys: [key], values: [value], expr: 'size($K) > $V' });
          return this;
        },
        ge: (value: string | number): QueryInstance<M> => {
          this.filterConditions.push({ keys: [key], values: [value], expr: 'size($K) >= $V' });
          return this;
        },
      }),
      not: () => ({
        eq: (value: string | number): QueryInstance<M> => this._ne(this.filterConditions, key, value),
        ne: (value: string | number): QueryInstance<M> => this._eq(this.filterConditions, key, value),
        lt: (value: string | number): QueryInstance<M> => this._ge(this.filterConditions, key, value),
        le: (value: string | number): QueryInstance<M> => this._gt(this.filterConditions, key, value),
        gt: (value: string | number): QueryInstance<M> => this._le(this.filterConditions, key, value),
        ge: (value: string | number): QueryInstance<M> => this._lt(this.filterConditions, key, value),
        contains: (value: string | number): QueryInstance<M> => {
          this.filterConditions.push({
            keys: [key],
            values: [value],
            expr: `NOT contains($K, $V)`,
          });
          return this;
        },
        in: (values: string[]): QueryInstance<M> => {
          this.filterConditions.push({ keys: [key], values, expr: `NOT ($K IN ${values.map(() => '$V').join(', ')})` });
          return this;
        },
        exists: (): QueryInstance<M> => {
          this.filterConditions.push({ keys: [key], expr: 'attribute_not_exists($K)' });
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

  public parenthesis(condition?: ConditionInstance<M>) {
    if (condition) {
      if (this.filterConditions.length > 0) {
        this.filterConditions.push({ expr: this.orBetweenCondition ? 'OR' : 'AND' });
      }
      this.orBetweenCondition = false;
      this.filterConditions.push(...[{ expr: '(' }, ...condition.conditions, { expr: ')' }]);
    }
    return this;
  }

  public group(condition?: ConditionInstance<M>) {
    return this.parenthesis(condition);
  }

  public condition(condition?: ConditionInstance<M>) {
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

  private _eq(conditions: ConditionExpression[], key: string, value: string | number): QueryInstance<M> {
    conditions.push({ keys: [key], values: [value], expr: '$K = $V' });
    return this;
  }

  private _ne(conditions: ConditionExpression[], key: string, value: string | number): QueryInstance<M> {
    conditions.push({ keys: [key], values: [value], expr: '$K = $V' });
    return this;
  }

  private _lt(conditions: ConditionExpression[], key: string, value: string | number): QueryInstance<M> {
    conditions.push({ keys: [key], values: [value], expr: '$K < $V' });
    return this;
  }

  private _le(conditions: ConditionExpression[], key: string, value: string | number): QueryInstance<M> {
    conditions.push({ keys: [key], values: [value], expr: '$K <= $V' });
    return this;
  }

  private _gt(conditions: ConditionExpression[], key: string, value: string | number): QueryInstance<M> {
    conditions.push({ keys: [key], values: [value], expr: '$K > $V' });
    return this;
  }

  private _ge(conditions: ConditionExpression[], key: string, value: string | number): QueryInstance<M> {
    conditions.push({ keys: [key], values: [value], expr: '$K >= $V' });
    return this;
  }

  private _beginsWith(conditions: ConditionExpression[], key: string, value: string | number): QueryInstance<M> {
    conditions.push({ keys: [key], values: [value], expr: 'begins_with($K, $V)' });
    return this;
  }

  private _between(conditions: ConditionExpression[], key: string, v1: string | number, v2: string | number): QueryInstance<M> {
    conditions.push({ keys: [key], values: [v1, v2], expr: '$K BETWEEN $V AND $V' });
    return this;
  }
}
