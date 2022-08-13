import { AttributeType, NegateFunction, SizeFunction } from '@Condition/types';
import { Model } from '@lib/Model';
import { ConditionExpression } from '@lib/utils/substituteConditions';

export type ConditionInstance<M extends typeof Model> = InstanceType<typeof Condition<M>>;

export class Condition<M extends typeof Model> {
  private Class: M;

  public conditions: ConditionExpression[];
  private key: string;
  private orBetweenCondition: boolean;

  constructor(model: M, key: string) {
    this.Class = model;

    this.conditions = [];
    this.orBetweenCondition = false;
    this.key = key;
  }

  public attribute(key: string) {
    if (this.conditions.length > 0) {
      this.conditions.push({ expr: this.orBetweenCondition ? 'OR' : 'AND' });
    }
    this.orBetweenCondition = false;
    this.key = key;
    return this;
  }

  public get and() {
    return this;
  }

  public get or() {
    this.orBetweenCondition = true;
    return this;
  }

  public parenthesis(condition: ConditionInstance<M>) {
    if (this.conditions.length > 0) {
      this.conditions.push({ expr: this.orBetweenCondition ? 'OR' : 'AND' });
    }
    this.orBetweenCondition = false;
    this.conditions.push(...[{ expr: '(' }, ...condition.conditions, { expr: ')' }]);
    return this;
  }

  public group(condition: ConditionInstance<M>) {
    return this.parenthesis(condition);
  }

  public contains(value: string | number): ConditionInstance<M> {
    this.conditions.push({ key: this.key, values: [value], expr: `contains($K, $V)` });
    return this;
  }

  public in(values: string[]): ConditionInstance<M> {
    this.conditions.push({ key: this.key, values, expr: `$K IN ${values.map(() => '$V').join(', ')}` });
    return this;
  }

  public type(value: AttributeType): ConditionInstance<M> {
    this.conditions.push({ key: this.key, values: [value], expr: 'attribute_type($K, $V)' });
    return this;
  }

  public size(): SizeFunction {
    return {
      eq: (value: string | number): ConditionInstance<M> => {
        this.conditions.push({ key: this.key, values: [value], expr: 'size($K) = $V' });
        return this;
      },
      ne: (value: string | number): ConditionInstance<M> => {
        this.conditions.push({ key: this.key, values: [value], expr: 'size($K) <> $V' });
        return this;
      },
      lt: (value: string | number): ConditionInstance<M> => {
        this.conditions.push({ key: this.key, values: [value], expr: 'size($K) < $V' });
        return this;
      },
      le: (value: string | number): ConditionInstance<M> => {
        this.conditions.push({ key: this.key, values: [value], expr: 'size($K) <= $V' });
        return this;
      },
      gt: (value: string | number): ConditionInstance<M> => {
        this.conditions.push({ key: this.key, values: [value], expr: 'size($K) > $V' });
        return this;
      },
      ge: (value: string | number): ConditionInstance<M> => {
        this.conditions.push({ key: this.key, values: [value], expr: 'size($K) >= $V' });
        return this;
      },
    };
  }

  public not(): NegateFunction {
    return {
      eq: (value: string | number): ConditionInstance<M> => this._ne(this.conditions, this.key, value),
      ne: (value: string | number): ConditionInstance<M> => this._eq(this.conditions, this.key, value),
      lt: (value: string | number): ConditionInstance<M> => this._ge(this.conditions, this.key, value),
      le: (value: string | number): ConditionInstance<M> => this._gt(this.conditions, this.key, value),
      gt: (value: string | number): ConditionInstance<M> => this._le(this.conditions, this.key, value),
      ge: (value: string | number): ConditionInstance<M> => this._lt(this.conditions, this.key, value),
      contains: (value: string | number): ConditionInstance<M> => {
        this.conditions.push({
          key: this.key,
          values: [value],
          expr: `NOT contains($K, $V)`,
        });
        return this;
      },
      in: (values: string[]): ConditionInstance<M> => {
        this.conditions.push({ key: this.key, values, expr: `NOT ($K IN ${values.map(() => '$V').join(', ')})` });
        return this;
      },
      exists: (): ConditionInstance<M> => {
        this.conditions.push({ key: this.key, expr: 'attribute_not_exists($K)' });
        return this;
      },
    };
  }

  public exists(): ConditionInstance<M> {
    this.conditions.push({ key: this.key, expr: 'attribute_not_exists($K)' });
    return this;
  }

  public eq(value: string | number): ConditionInstance<M> {
    return this._eq(this.conditions, this.key, value);
  }

  public ne(value: string | number): ConditionInstance<M> {
    return this._ne(this.conditions, this.key, value);
  }

  public lt(value: string | number): ConditionInstance<M> {
    return this._lt(this.conditions, this.key, value);
  }
  public le(value: string | number): ConditionInstance<M> {
    return this._le(this.conditions, this.key, value);
  }

  public gt(value: string | number): ConditionInstance<M> {
    return this._gt(this.conditions, this.key, value);
  }

  public ge(value: string | number): ConditionInstance<M> {
    return this._ge(this.conditions, this.key, value);
  }

  public beginsWith(value: string | number): ConditionInstance<M> {
    return this._beginsWith(this.conditions, this.key, value);
  }

  public between(value1: string | number, value2: string | number): ConditionInstance<M> {
    return this._between(this.conditions, this.key, value1, value2);
  }

  private _eq(conditions: ConditionExpression[], key: string, value: string | number): ConditionInstance<M> {
    conditions.push({ key, values: [value], expr: '$K = $V' });
    return this;
  }

  private _ne(conditions: ConditionExpression[], key: string, value: string | number): ConditionInstance<M> {
    conditions.push({ key, values: [value], expr: '$K = $V' });
    return this;
  }

  private _lt(conditions: ConditionExpression[], key: string, value: string | number): ConditionInstance<M> {
    conditions.push({ key, values: [value], expr: '$K < $V' });
    return this;
  }

  private _le(conditions: ConditionExpression[], key: string, value: string | number): ConditionInstance<M> {
    conditions.push({ key, values: [value], expr: '$K <= $V' });
    return this;
  }

  private _gt(conditions: ConditionExpression[], key: string, value: string | number): ConditionInstance<M> {
    conditions.push({ key, values: [value], expr: '$K > $V' });
    return this;
  }

  private _ge(conditions: ConditionExpression[], key: string, value: string | number): ConditionInstance<M> {
    conditions.push({ key, values: [value], expr: '$K >= $V' });
    return this;
  }

  private _beginsWith(conditions: ConditionExpression[], key: string, value: string | number): ConditionInstance<M> {
    conditions.push({ key, values: [value], expr: 'begins_with($K, $V)' });
    return this;
  }

  private _between(conditions: ConditionExpression[], key: string, v1: string | number, v2: string | number): ConditionInstance<M> {
    conditions.push({ key, values: [v1, v2], expr: '$K BETWEEN $V AND $V' });
    return this;
  }
}
