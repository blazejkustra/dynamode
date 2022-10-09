import { QueryCommandOutput, QueryInput } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { AttributeType, Operator } from '@lib/condition/types';
import { Entity, EntityKey, EntityPartitionKeys, EntityPrimaryKey, EntitySortKeys, EntityValue } from '@lib/entity/types';
import { BuildQueryConditionExpression, QueryRunOptions, QueryRunOutput } from '@lib/query/types';
import { getDynamodeStorage } from '@lib/storage';
import { AttributeMap, buildExpression, checkDuplicatesInArray, ConditionExpression, DefaultError, isNotEmpty, timeout } from '@lib/utils';

export default class Query<T extends Entity<T>> {
  private entity: T;
  private queryInput: QueryInput;
  private keyConditions: ConditionExpression[] = [];
  private filterConditions: ConditionExpression[] = [];
  private operator = Operator.AND;

  constructor(entity: T) {
    this.entity = entity;
    this.queryInput = {
      TableName: entity.tableName,
    };
  }

  public run(): Promise<QueryRunOutput<T>>;
  public run(options: Omit<QueryRunOptions, 'return'>): Promise<QueryRunOutput<T>>;
  public run(options: QueryRunOptions & { return: 'default' }): Promise<QueryRunOutput<T>>;
  public run(options: QueryRunOptions & { return: 'output' }): Promise<QueryCommandOutput>;
  public run(options: QueryRunOptions & { return: 'input' }): QueryInput;
  public run(options?: QueryRunOptions): Promise<QueryRunOutput<T> | QueryCommandOutput> | QueryInput {
    this.buildQueryInput(options?.extraInput);
    this.validateQueryInput();

    if (options?.return === 'input') {
      return this.queryInput;
    }

    return (async () => {
      if (options?.return === 'output') {
        const result = await this.entity.ddb.query(this.queryInput);
        return result;
      }

      const all = options?.all ?? false;
      const delay = options?.delay ?? 0;
      const max = options?.max ?? Infinity;
      const items: AttributeMap[] = [];

      let count = 0;
      let scannedCount = 0;
      let lastKey: AttributeMap | undefined = undefined;

      do {
        const result = await this.entity.ddb.query(this.queryInput);
        await timeout(delay);
        items.push(...(result.Items || []));

        lastKey = result.LastEvaluatedKey;
        this.queryInput.ExclusiveStartKey = lastKey;

        count += result.Count || 0;
        scannedCount += result.ScannedCount || 0;
      } while (all && !!lastKey && count < max);

      return {
        items: items.map((item) => this.entity.convertAttributeMapToEntity(item)),
        count,
        scannedCount,
        lastKey: lastKey && this.entity.convertAttributeMapToPrimaryKey(lastKey),
      };
    })();
  }

  public partitionKey<K extends EntityKey<T>>(key: K & EntityPartitionKeys<T>) {
    const columns = getDynamodeStorage().getEntityColumns(this.entity.tableName, this.entity.name);
    const indexName = columns[String(key)].indexName;
    if (indexName) this.queryInput.IndexName = indexName;

    return {
      eq: (value: EntityValue<T, K>) => this._eq(this.keyConditions, key, value),
    };
  }

  public sortKey<K extends EntityKey<T>>(key: K & EntitySortKeys<T>) {
    this.keyConditions.push({ expr: Operator.AND });

    return {
      eq: (value: EntityValue<T, K>) => this._eq(this.keyConditions, key, value),
      ne: (value: EntityValue<T, K>) => this._ne(this.keyConditions, key, value),
      lt: (value: EntityValue<T, K>) => this._lt(this.keyConditions, key, value),
      le: (value: EntityValue<T, K>) => this._le(this.keyConditions, key, value),
      gt: (value: EntityValue<T, K>) => this._gt(this.keyConditions, key, value),
      ge: (value: EntityValue<T, K>) => this._ge(this.keyConditions, key, value),
      beginsWith: (value: EntityValue<T, K>) => this._beginsWith(this.keyConditions, key, value),
      between: (value1: EntityValue<T, K>, value2: EntityValue<T, K>) => this._between(this.keyConditions, key, value1, value2),
    };
  }

  public filter<K extends EntityKey<T>>(key: K) {
    if (this.filterConditions.length > 0) {
      this.filterConditions.push({ expr: this.operator });
    }
    this.operator = Operator.AND;

    return {
      eq: (value: EntityValue<T, K>): Query<T> => this._eq(this.filterConditions, key, value),
      ne: (value: EntityValue<T, K>): Query<T> => this._ne(this.filterConditions, key, value),
      lt: (value: EntityValue<T, K>): Query<T> => this._lt(this.filterConditions, key, value),
      le: (value: EntityValue<T, K>): Query<T> => this._le(this.filterConditions, key, value),
      gt: (value: EntityValue<T, K>): Query<T> => this._gt(this.filterConditions, key, value),
      ge: (value: EntityValue<T, K>): Query<T> => this._ge(this.filterConditions, key, value),
      beginsWith: (value: EntityValue<T, K>): Query<T> => this._beginsWith(this.filterConditions, key, value),
      between: (value1: EntityValue<T, K>, value2: EntityValue<T, K>): Query<T> => this._between(this.filterConditions, key, value1, value2),
      contains: (value: EntityValue<T, K>): Query<T> => {
        this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: `contains($K, $V)` });
        return this;
      },
      in: (values: EntityValue<T, K>[]): Query<T> => {
        const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
        this.filterConditions.push({ keys: [String(key)], values: processedValues, expr: `$K IN ${Array(values.length).fill('$V').join(', ')}` });
        return this;
      },
      type: (value: AttributeType): Query<T> => {
        this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'attribute_type($K, $V)' });
        return this;
      },
      exists: (): Query<T> => {
        this.filterConditions.push({ keys: [String(key)], expr: 'attribute_exists($K)' });
        return this;
      },
      size: () => ({
        eq: (value: EntityValue<T, K>): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) = $V' });
          return this;
        },
        ne: (value: EntityValue<T, K>): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) <> $V' });
          return this;
        },
        lt: (value: EntityValue<T, K>): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) < $V' });
          return this;
        },
        le: (value: EntityValue<T, K>): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) <= $V' });
          return this;
        },
        gt: (value: EntityValue<T, K>): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) > $V' });
          return this;
        },
        ge: (value: EntityValue<T, K>): Query<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) >= $V' });
          return this;
        },
      }),
      not: () => ({
        eq: (value: EntityValue<T, K>): Query<T> => this._ne(this.filterConditions, key, value),
        ne: (value: EntityValue<T, K>): Query<T> => this._eq(this.filterConditions, key, value),
        lt: (value: EntityValue<T, K>): Query<T> => this._ge(this.filterConditions, key, value),
        le: (value: EntityValue<T, K>): Query<T> => this._gt(this.filterConditions, key, value),
        gt: (value: EntityValue<T, K>): Query<T> => this._le(this.filterConditions, key, value),
        ge: (value: EntityValue<T, K>): Query<T> => this._lt(this.filterConditions, key, value),
        contains: (value: EntityValue<T, K>): Query<T> => {
          this.filterConditions.push({
            keys: [String(key)],
            values: [this.entity.prefixSuffixValue(key, value)],
            expr: `NOT contains($K, $V)`,
          });
          return this;
        },
        in: (values: Array<EntityValue<T, K>>): Query<T> => {
          const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
          this.filterConditions.push({ keys: [String(key)], values: processedValues, expr: `NOT ($K IN ${Array(values.length).fill('$V').join(', ')})` });
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
    this.operator = Operator.AND;
    return this;
  }

  public get or() {
    this.operator = Operator.OR;
    return this;
  }

  public parenthesis(condition?: Condition<T>) {
    if (condition) {
      if (this.filterConditions.length > 0) {
        this.filterConditions.push({ expr: this.operator });
      }
      this.operator = Operator.AND;
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
        this.filterConditions.push({ expr: this.operator });
      }
      this.operator = Operator.AND;
      this.filterConditions.push(...condition.conditions);
    }
    return this;
  }

  public limit(count: number) {
    this.queryInput.Limit = count;
    return this;
  }

  public startAt(key?: EntityPrimaryKey<T>) {
    if (key) this.queryInput.ExclusiveStartKey = this.entity.convertPrimaryKeyToAttributeMap(key);
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

  public attributes(attributes: Array<EntityKey<T>>) {
    if (checkDuplicatesInArray(attributes)) {
      throw new DefaultError();
    }

    this.queryInput.ProjectionExpression = attributes.join(', ');
    return this;
  }

  private _eq<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Query<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K = $V' });
    return this;
  }

  private _ne<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Query<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K <> $V' });
    return this;
  }

  private _lt<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Query<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K < $V' });
    return this;
  }

  private _le<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Query<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K <= $V' });
    return this;
  }

  private _gt<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Query<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K > $V' });
    return this;
  }

  private _ge<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Query<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K >= $V' });
    return this;
  }

  private _beginsWith<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Query<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'begins_with($K, $V)' });
    return this;
  }

  private _between<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, v1: EntityValue<T, K>, v2: EntityValue<T, K>): Query<T> {
    conditions.push({ keys: [String(key), String(key)], values: [this.entity.prefixSuffixValue(key, v1), this.entity.prefixSuffixValue(key, v2)], expr: '$K BETWEEN $V AND $V' });
    return this;
  }

  private buildQueryInput(queryInput?: Partial<QueryInput>) {
    const { conditionExpression, keyConditionExpression, attributeNames, attributeValues } = this.buildQueryConditionExpression();

    if (keyConditionExpression) {
      this.queryInput.KeyConditionExpression = keyConditionExpression;
    }

    if (conditionExpression) {
      this.queryInput.FilterExpression = conditionExpression;
    }

    if (isNotEmpty(attributeNames)) {
      this.queryInput.ExpressionAttributeNames = attributeNames;
    }

    if (isNotEmpty(attributeValues)) {
      this.queryInput.ExpressionAttributeValues = attributeValues;
    }

    this.queryInput = { ...this.queryInput, ...queryInput };
  }

  //TODO: Implement validation
  private validateQueryInput() {
    // ValidationException: Invalid FilterExpression: The BETWEEN operator requires upper bound to be greater than or equal to lower bound; lower bound operand: AttributeValue: {S:5}, upper bound operand: AttributeValue: {S:100}
    // Index validation
    console.log('validateQueryInput');
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
