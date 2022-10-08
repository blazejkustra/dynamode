import { AttributeType, Operator } from '@Condition/types';
import { Entity, EntityKey, EntityValue } from '@lib/Entity/types';
import { ConditionExpression } from '@lib/utils';

export class Condition<T extends Entity<T>> {
  private entity: T;
  public conditions: ConditionExpression[];
  private operator = Operator.AND;

  constructor(entity: T) {
    this.entity = entity;
    this.conditions = [];
  }

  public attribute<K extends EntityKey<T>>(key: K) {
    if (this.conditions.length > 0) {
      this.conditions.push({ expr: this.operator });
    }
    this.operator = Operator.AND;

    return {
      eq: (value: EntityValue<T, K>): Condition<T> => this._eq(this.conditions, key, value),
      ne: (value: EntityValue<T, K>): Condition<T> => this._ne(this.conditions, key, value),
      lt: (value: EntityValue<T, K>): Condition<T> => this._lt(this.conditions, key, value),
      le: (value: EntityValue<T, K>): Condition<T> => this._le(this.conditions, key, value),
      gt: (value: EntityValue<T, K>): Condition<T> => this._gt(this.conditions, key, value),
      ge: (value: EntityValue<T, K>): Condition<T> => this._ge(this.conditions, key, value),
      beginsWith: (value: EntityValue<T, K>): Condition<T> => this._beginsWith(this.conditions, key, value),
      between: (value1: EntityValue<T, K>, value2: EntityValue<T, K>): Condition<T> => this._between(this.conditions, key, value1, value2),
      contains: (value: EntityValue<T, K>): Condition<T> => {
        this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: `contains($K, $V)` });
        return this;
      },
      in: (values: Array<EntityValue<T, K>>): Condition<T> => {
        const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
        this.conditions.push({ keys: [String(key)], values: processedValues, expr: `$K IN ${Array(values.length).fill('$V').join(', ')}` });
        return this;
      },
      type: (value: AttributeType): Condition<T> => {
        this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'attribute_type($K, $V)' });
        return this;
      },

      exists: (): Condition<T> => {
        this.conditions.push({ keys: [String(key)], expr: 'attribute_exists($K)' });
        return this;
      },
      size: () => {
        return {
          eq: (value: EntityValue<T, K>): Condition<T> => {
            this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) = $V' });
            return this;
          },
          ne: (value: EntityValue<T, K>): Condition<T> => {
            this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) <> $V' });
            return this;
          },
          lt: (value: EntityValue<T, K>): Condition<T> => {
            this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) < $V' });
            return this;
          },
          le: (value: EntityValue<T, K>): Condition<T> => {
            this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) <= $V' });
            return this;
          },
          gt: (value: EntityValue<T, K>): Condition<T> => {
            this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) > $V' });
            return this;
          },
          ge: (value: EntityValue<T, K>): Condition<T> => {
            this.conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'size($K) >= $V' });
            return this;
          },
        };
      },
      not: () => {
        return {
          eq: (value: EntityValue<T, K>): Condition<T> => this._ne(this.conditions, key, value),
          ne: (value: EntityValue<T, K>): Condition<T> => this._eq(this.conditions, key, value),
          lt: (value: EntityValue<T, K>): Condition<T> => this._ge(this.conditions, key, value),
          le: (value: EntityValue<T, K>): Condition<T> => this._gt(this.conditions, key, value),
          gt: (value: EntityValue<T, K>): Condition<T> => this._le(this.conditions, key, value),
          ge: (value: EntityValue<T, K>): Condition<T> => this._lt(this.conditions, key, value),
          contains: (value: EntityValue<T, K>): Condition<T> => {
            this.conditions.push({
              keys: [String(key)],
              values: [this.entity.prefixSuffixValue(key, value)],
              expr: `NOT contains($K, $V)`,
            });
            return this;
          },
          in: (values: Array<EntityValue<T, K>>): Condition<T> => {
            const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
            this.conditions.push({ keys: [String(key)], values: processedValues, expr: `NOT ($K IN ${Array(values.length).fill('$V').join(', ')})` });
            return this;
          },
          exists: (): Condition<T> => {
            this.conditions.push({ keys: [String(key)], expr: 'attribute_not_exists($K)' });
            return this;
          },
        };
      },
    };
  }

  public get and(): Condition<T> {
    this.operator = Operator.AND;
    return this;
  }

  public get or(): Condition<T> {
    this.operator = Operator.OR;
    return this;
  }

  public parenthesis(condition?: Condition<T>): Condition<T> {
    if (condition) {
      if (this.conditions.length > 0) {
        this.conditions.push({ expr: this.operator });
      }
      this.operator = Operator.AND;
      this.conditions.push(...[{ expr: '(' }, ...condition.conditions, { expr: ')' }]);
    }
    return this;
  }

  public group(condition?: Condition<T>): Condition<T> {
    return this.parenthesis(condition);
  }

  public condition(condition?: Condition<T>): Condition<T> {
    if (condition) {
      if (this.conditions.length > 0) {
        this.conditions.push({ expr: this.operator });
      }
      this.operator = Operator.AND;
      this.conditions.push(...condition.conditions);
    }
    return this;
  }

  private _eq<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Condition<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K = $V' });
    return this;
  }

  private _ne<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Condition<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K <> $V' });
    return this;
  }

  private _lt<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Condition<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K < $V' });
    return this;
  }

  private _le<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Condition<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K <= $V' });
    return this;
  }

  private _gt<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Condition<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K > $V' });
    return this;
  }

  private _ge<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Condition<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: '$K >= $V' });
    return this;
  }

  private _beginsWith<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, value: EntityValue<T, K>): Condition<T> {
    conditions.push({ keys: [String(key)], values: [this.entity.prefixSuffixValue(key, value)], expr: 'begins_with($K, $V)' });
    return this;
  }

  private _between<K extends EntityKey<T>>(conditions: ConditionExpression[], key: K, v1: EntityValue<T, K>, v2: EntityValue<T, K>): Condition<T> {
    conditions.push({ keys: [String(key), String(key)], values: [this.entity.prefixSuffixValue(key, v1), this.entity.prefixSuffixValue(key, v2)], expr: '$K BETWEEN $V AND $V' });
    return this;
  }
}
