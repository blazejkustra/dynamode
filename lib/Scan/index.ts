import { ScanCommandOutput, ScanInput } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { AttributeType, Operator } from '@lib/condition/types';
import { Entity, EntityIndexNames, EntityKey, EntityPrimaryKey, EntityValue } from '@lib/entity/types';
import { BuildScanConditionExpression, ScanRunOptions, ScanRunOutput } from '@lib/scan/types';
import { AttributeMap, buildExpression, checkDuplicatesInArray, ConditionExpression, DefaultError, isNotEmpty } from '@lib/utils';

export default class Scan<T extends Entity<T>> {
  private entity: T;
  private scanInput: ScanInput;
  private filterConditions: ConditionExpression[] = [];
  private operator = Operator.AND;

  constructor(entity: T) {
    this.entity = entity;
    this.scanInput = {
      TableName: entity.tableName,
    };
  }

  public run(): Promise<ScanRunOutput<T>>;
  public run(options: Omit<ScanRunOptions, 'return'>): Promise<ScanRunOutput<T>>;
  public run(options: ScanRunOptions & { return: 'default' }): Promise<ScanRunOutput<T>>;
  public run(options: ScanRunOptions & { return: 'output' }): Promise<ScanCommandOutput>;
  public run(options: ScanRunOptions & { return: 'input' }): ScanInput;
  public run(options?: ScanRunOptions): Promise<ScanRunOutput<T> | ScanCommandOutput> | ScanInput {
    this.buildScanInput(options?.extraInput);
    this.validateScanInput();

    if (options?.return === 'input') {
      return this.scanInput;
    }

    return (async () => {
      const result = await this.entity.ddb.scan(this.scanInput);

      if (options?.return === 'output') {
        return result;
      }

      const items = result.Items || [];

      return {
        items: items.map((item) => this.entity.convertAttributeMapToEntity(item)),
        count: result.Count || 0,
        scannedCount: result.ScannedCount || 0,
        lastKey: result.LastEvaluatedKey ? this.entity.convertAttributeMapToPrimaryKey(result.LastEvaluatedKey) : undefined,
      };
    })();
  }

  public filter<K extends EntityKey<T>>(key: K) {
    if (this.filterConditions.length > 0) {
      this.filterConditions.push({ expr: this.operator });
    }
    this.operator = Operator.AND;

    return {
      eq: (value: EntityValue<T, K>): Scan<T> => this._eq(this.filterConditions, key, value),
      ne: (value: EntityValue<T, K>): Scan<T> => this._ne(this.filterConditions, key, value),
      lt: (value: EntityValue<T, K>): Scan<T> => this._lt(this.filterConditions, key, value),
      le: (value: EntityValue<T, K>): Scan<T> => this._le(this.filterConditions, key, value),
      gt: (value: EntityValue<T, K>): Scan<T> => this._gt(this.filterConditions, key, value),
      ge: (value: EntityValue<T, K>): Scan<T> => this._ge(this.filterConditions, key, value),
      beginsWith: (value: EntityValue<T, K>): Scan<T> => this._beginsWith(this.filterConditions, key, value),
      between: (value1: EntityValue<T, K>, value2: EntityValue<T, K>): Scan<T> => this._between(this.filterConditions, key, value1, value2),
      contains: (value: EntityValue<T, K>): Scan<T> => {
        this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: `contains($K, $V)` });
        return this;
      },
      in: (values: EntityValue<T, K>[]): Scan<T> => {
        const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
        this.filterConditions.push({ keys: [String(key)], values: processedValues, expr: `$K IN ${Array(values.length).fill('$V').join(', ')}` });
        return this;
      },
      type: (value: AttributeType): Scan<T> => {
        this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'attribute_type($K, $V)' });
        return this;
      },
      exists: (): Scan<T> => {
        this.filterConditions.push({ keys: [String(key)], expr: 'attribute_exists($K)' });
        return this;
      },
      size: () => ({
        eq: (value: EntityValue<T, K>): Scan<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) = $V' });
          return this;
        },
        ne: (value: EntityValue<T, K>): Scan<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) <> $V' });
          return this;
        },
        lt: (value: EntityValue<T, K>): Scan<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) < $V' });
          return this;
        },
        le: (value: EntityValue<T, K>): Scan<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) <= $V' });
          return this;
        },
        gt: (value: EntityValue<T, K>): Scan<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) > $V' });
          return this;
        },
        ge: (value: EntityValue<T, K>): Scan<T> => {
          this.filterConditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) >= $V' });
          return this;
        },
      }),
      not: () => ({
        eq: (value: EntityValue<T, K>): Scan<T> => this._ne(this.filterConditions, key, value),
        ne: (value: EntityValue<T, K>): Scan<T> => this._eq(this.filterConditions, key, value),
        lt: (value: EntityValue<T, K>): Scan<T> => this._ge(this.filterConditions, key, value),
        le: (value: EntityValue<T, K>): Scan<T> => this._gt(this.filterConditions, key, value),
        gt: (value: EntityValue<T, K>): Scan<T> => this._le(this.filterConditions, key, value),
        ge: (value: EntityValue<T, K>): Scan<T> => this._lt(this.filterConditions, key, value),
        contains: (value: EntityValue<T, K>): Scan<T> => {
          this.filterConditions.push({
            keys: [String(key)],
            values: [this.entity.prefixSuffixValue(key, value)],
            expr: `NOT contains($K, $V)`,
          });
          return this;
        },
        in: (values: Array<EntityValue<T, K>>): Scan<T> => {
          const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
          this.filterConditions.push({ keys: [String(key)], values: processedValues, expr: `NOT ($K IN ${Array(values.length).fill('$V').join(', ')})` });
          return this;
        },
        exists: (): Scan<T> => {
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
    this.scanInput.Limit = count;
    return this;
  }

  public startAt(key?: EntityPrimaryKey<T>) {
    if (key) this.scanInput.ExclusiveStartKey = this.entity.convertPrimaryKeyToAttributeMap(key);
    return this;
  }

  public consistent() {
    this.scanInput.ConsistentRead = true;
    return this;
  }

  public count() {
    this.scanInput.Select = 'COUNT';
    return this;
  }

  public attributes(attributes: Array<EntityKey<T>>) {
    if (checkDuplicatesInArray(attributes)) {
      throw new DefaultError();
    }

    this.scanInput.ProjectionExpression = attributes.join(', ');
    return this;
  }

  public indexName(name: EntityIndexNames<T>) {
    this.scanInput.IndexName = String(name);
    return this;
  }

  public segment(value: number) {
    this.scanInput.Segment = value;
    return this;
  }

  public totalSegments(value: number) {
    this.scanInput.TotalSegments = value;
    return this;
  }

  private _eq<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Scan<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K = $V' });
    return this;
  }

  private _ne<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Scan<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K <> $V' });
    return this;
  }

  private _lt<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Scan<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K < $V' });
    return this;
  }

  private _le<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Scan<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K <= $V' });
    return this;
  }

  private _gt<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Scan<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K > $V' });
    return this;
  }

  private _ge<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Scan<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K >= $V' });
    return this;
  }

  private _beginsWith<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Scan<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'begins_with($K, $V)' });
    return this;
  }

  private _between<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, v1: EntityValue<T, K>, v2: EntityValue<T, K>): Scan<T> {
    conditions.push({ keys: [String(key), String(key)], values: [this.entity.prefixSuffixValue(key, v1), this.entity.prefixSuffixValue(key, v2)], expr: '$K BETWEEN $V AND $V' });
    return this;
  }

  private buildScanInput(scanInput?: Partial<ScanInput>) {
    const { conditionExpression, attributeNames, attributeValues } = this.buildScanConditionExpression();

    if (conditionExpression) {
      this.scanInput.FilterExpression = conditionExpression;
    }

    if (isNotEmpty(attributeNames)) {
      this.scanInput.ExpressionAttributeNames = attributeNames;
    }

    if (isNotEmpty(attributeValues)) {
      this.scanInput.ExpressionAttributeValues = attributeValues;
    }

    this.scanInput = { ...this.scanInput, ...scanInput };
  }

  //TODO: Implement validation
  private validateScanInput() {
    console.log('validateScanInput');
  }

  private buildScanConditionExpression(): BuildScanConditionExpression {
    const attributeNames: Record<string, string> = {};
    const attributeValues: AttributeMap = {};

    return {
      attributeNames,
      attributeValues,
      conditionExpression: buildExpression(this.filterConditions, attributeNames, attributeValues),
    };
  }
}
