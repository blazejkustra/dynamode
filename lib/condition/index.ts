import { AttributeType, Operator } from '@lib/condition/types';
import { Entity, EntityKey, EntityValue } from '@lib/entity/types';
import { ConditionExpression } from '@lib/utils';

export default class Condition<T extends Entity<T>> {
  protected entity: T;
  protected operator = Operator.AND;
  public conditions: ConditionExpression[];

  constructor(entity: T) {
    this.entity = entity;
    this.conditions = [];
  }

  public attribute<C extends Condition<T>, K extends EntityKey<T>>(this: C, key: K) {
    this.maybePushOperator(this.conditions);

    return {
      eq: (value: EntityValue<T, K>): C => this.eq(this.conditions, key, value),
      ne: (value: EntityValue<T, K>): C => this.ne(this.conditions, key, value),
      lt: (value: EntityValue<T, K>): C => this.lt(this.conditions, key, value),
      le: (value: EntityValue<T, K>): C => this.le(this.conditions, key, value),
      gt: (value: EntityValue<T, K>): C => this.gt(this.conditions, key, value),
      ge: (value: EntityValue<T, K>): C => this.ge(this.conditions, key, value),
      beginsWith: (value: EntityValue<T, K>): C => this.beginsWith(this.conditions, key, value),
      between: (value1: EntityValue<T, K>, value2: EntityValue<T, K>): C => this.between(this.conditions, key, value1, value2),
      contains: (value: EntityValue<T, K>): C => {
        this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: `contains($K, $V)` });
        return this;
      },
      in: (values: Array<EntityValue<T, K>>): C => {
        const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
        this.conditions.push({ keys: [String(key)], values: processedValues, expr: `$K IN ${Array(values.length).fill('$V').join(', ')}` });
        return this;
      },
      type: (value: AttributeType): C => {
        this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'attribute_type($K, $V)' });
        return this;
      },
      exists: (): C => {
        this.conditions.push({ keys: [String(key)], expr: 'attribute_exists($K)' });
        return this;
      },
      size: () => ({
        eq: (value: EntityValue<T, K>): C => {
          this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) = $V' });
          return this;
        },
        ne: (value: EntityValue<T, K>): C => {
          this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) <> $V' });
          return this;
        },
        lt: (value: EntityValue<T, K>): C => {
          this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) < $V' });
          return this;
        },
        le: (value: EntityValue<T, K>): C => {
          this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) <= $V' });
          return this;
        },
        gt: (value: EntityValue<T, K>): C => {
          this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) > $V' });
          return this;
        },
        ge: (value: EntityValue<T, K>): C => {
          this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) >= $V' });
          return this;
        },
      }),
      not: () => ({
        eq: (value: EntityValue<T, K>): C => this.ne(this.conditions, key, value),
        ne: (value: EntityValue<T, K>): C => this.eq(this.conditions, key, value),
        lt: (value: EntityValue<T, K>): C => this.ge(this.conditions, key, value),
        le: (value: EntityValue<T, K>): C => this.gt(this.conditions, key, value),
        gt: (value: EntityValue<T, K>): C => this.le(this.conditions, key, value),
        ge: (value: EntityValue<T, K>): C => this.lt(this.conditions, key, value),
        contains: (value: EntityValue<T, K>): C => {
          this.conditions.push({
            keys: [String(key)],
            values: [this.entity.prefixSuffixValue(key, value)],
            expr: `NOT contains($K, $V)`,
          });
          return this;
        },
        in: (values: Array<EntityValue<T, K>>): C => {
          const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
          this.conditions.push({ keys: [String(key)], values: processedValues, expr: `NOT ($K IN ${Array(values.length).fill('$V').join(', ')})` });
          return this;
        },
        exists: (): C => {
          this.conditions.push({ keys: [String(key)], expr: 'attribute_not_exists($K)' });
          return this;
        },
      }),
    };
  }

  public parenthesis(condition?: Condition<T>): this {
    if (condition) {
      this.maybePushOperator(this.conditions);
      this.conditions.push(...[{ expr: '(' }, ...condition.conditions, { expr: ')' }]);
    }
    return this;
  }

  public group(condition?: Condition<T>): this {
    return this.parenthesis(condition);
  }

  public condition(condition?: Condition<T>): this {
    if (condition) {
      this.maybePushOperator(this.conditions);
      this.conditions.push(...condition.conditions);
    }
    return this;
  }

  public get and(): this {
    this.operator = Operator.AND;
    return this;
  }

  public get or(): this {
    this.operator = Operator.OR;
    return this;
  }

  protected eq<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): this {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K = $V' });
    return this;
  }

  protected ne<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): this {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K <> $V' });
    return this;
  }

  protected lt<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): this {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K < $V' });
    return this;
  }

  protected le<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): this {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K <= $V' });
    return this;
  }

  protected gt<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): this {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K > $V' });
    return this;
  }

  protected ge<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): this {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K >= $V' });
    return this;
  }

  protected beginsWith<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): this {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'begins_with($K, $V)' });
    return this;
  }

  protected between<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, v1: EntityValue<T, K>, v2: EntityValue<T, K>): this {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, v1), this.entity.prefixSuffixValue(key, v2)], expr: '$K BETWEEN $V AND $V' });
    return this;
  }

  protected maybePushOperator(conditions: ConditionExpression[]) {
    if (conditions.length > 0) {
      conditions.push({ expr: this.operator });
    }
    this.operator = Operator.AND;
  }
}

export { AttributeType };
