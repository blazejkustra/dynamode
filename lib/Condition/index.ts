import { AttributeType } from '@Condition/types';
import { Model } from '@lib/Model';

export interface QueryOptions {
  index: unknown;
}

interface SizeFunction {
  eq: (value: string | number) => InstanceType<typeof Condition>;
  ne: (value: string | number) => InstanceType<typeof Condition>;
  lt: (value: string | number) => InstanceType<typeof Condition>;
  le: (value: string | number) => InstanceType<typeof Condition>;
  gt: (value: string | number) => InstanceType<typeof Condition>;
  ge: (value: string | number) => InstanceType<typeof Condition>;
}

interface NegateFunction {
  eq: (value: string | number) => InstanceType<typeof Condition>;
  ne: (value: string | number) => InstanceType<typeof Condition>;
  lt: (value: string | number) => InstanceType<typeof Condition>;
  le: (value: string | number) => InstanceType<typeof Condition>;
  gt: (value: string | number) => InstanceType<typeof Condition>;
  ge: (value: string | number) => InstanceType<typeof Condition>;
  exists: () => InstanceType<typeof Condition>;
  in: (values: string[]) => InstanceType<typeof Condition>;
  contains: (value: string | number) => InstanceType<typeof Condition>;
}

export class Condition<M extends typeof Model = typeof Model> {
  private Class: M;

  public conditions: string[];
  private key: string | number;
  private orBetweenCondition: boolean;

  constructor(model: M, key: string | number) {
    this.Class = model;

    this.conditions = [];
    this.orBetweenCondition = false;
    this.key = key;
  }

  public attribute(key: string | number) {
    if (this.conditions.length > 0) {
      this.conditions.push(`${this.orBetweenCondition ? 'OR' : 'AND'}`);
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

  public parenthesis() {
    return this;
  }

  public group() {
    return this.parenthesis();
  }

  public contains(value: string | number): InstanceType<typeof Condition> {
    this.conditions.push(`contains(${this.key}, ${value})`);
    return this;
  }

  public in(values: string[]): InstanceType<typeof Condition> {
    this.conditions.push(`${this.key} IN ${values.join(', ')}`);
    return this;
  }

  public type(value: AttributeType): InstanceType<typeof Condition> {
    this.conditions.push(`attribute_type(${this.key}, ${value})`);
    return this;
  }

  public size(): SizeFunction {
    return {
      eq: (value: string | number) => this._eq(this.conditions, `size(${this.key})`, value),
      ne: (value: string | number) => this._ne(this.conditions, `size(${this.key})`, value),
      lt: (value: string | number) => this._lt(this.conditions, `size(${this.key})`, value),
      le: (value: string | number) => this._le(this.conditions, `size(${this.key})`, value),
      gt: (value: string | number) => this._gt(this.conditions, `size(${this.key})`, value),
      ge: (value: string | number) => this._ge(this.conditions, `size(${this.key})`, value),
    };
  }

  public not(): NegateFunction {
    return {
      eq: (value: string | number) => this._ne(this.conditions, this.key, value),
      ne: (value: string | number) => this._eq(this.conditions, this.key, value),
      lt: (value: string | number) => this._ge(this.conditions, this.key, value),
      le: (value: string | number) => this._gt(this.conditions, this.key, value),
      gt: (value: string | number) => this._le(this.conditions, this.key, value),
      ge: (value: string | number) => this._lt(this.conditions, this.key, value),
      contains: (value: string | number) => {
        this.conditions.push(`NOT contains(${this.key}, ${value})`);
        return this;
      },
      in: (values: string[]) => {
        this.conditions.push(`NOT (${this.key} IN ${values.join(', ')})`);
        return this;
      },
      exists: () => {
        this.conditions.push(`attribute_not_exists(${this.key})`);
        return this;
      },
    };
  }

  public exists(): InstanceType<typeof Condition> {
    this.conditions.push(`attribute_exists(${this.key})`);
    return this;
  }

  public eq(value: string | number): InstanceType<typeof Condition> {
    return this._eq(this.conditions, this.key, value);
  }

  public ne(value: string | number): InstanceType<typeof Condition> {
    return this._ne(this.conditions, this.key, value);
  }

  public lt(value: string | number): InstanceType<typeof Condition> {
    return this._lt(this.conditions, this.key, value);
  }
  public le(value: string | number): InstanceType<typeof Condition> {
    return this._le(this.conditions, this.key, value);
  }

  public gt(value: string | number): InstanceType<typeof Condition> {
    return this._gt(this.conditions, this.key, value);
  }

  public ge(value: string | number): InstanceType<typeof Condition> {
    return this._ge(this.conditions, this.key, value);
  }

  public beginsWith(value: string | number): InstanceType<typeof Condition> {
    return this._beginsWith(this.conditions, this.key, value);
  }

  public between(value1: string | number, value2: string | number): InstanceType<typeof Condition> {
    return this._between(this.conditions, this.key, value1, value2);
  }

  private _eq(conditions: string[], key: string | number, value: string | number): InstanceType<typeof Condition> {
    conditions.push(`${key} = ${value}`);
    return this;
  }

  private _ne(conditions: string[], key: string | number, value: string | number): InstanceType<typeof Condition> {
    conditions.push(`${key} <> ${value}`);
    return this;
  }

  private _lt(conditions: string[], key: string | number, value: string | number): InstanceType<typeof Condition> {
    conditions.push(`${key} < ${value}`);
    return this;
  }

  private _le(conditions: string[], key: string | number, value: string | number): InstanceType<typeof Condition> {
    conditions.push(`${key} <= ${value}`);
    return this;
  }

  private _gt(conditions: string[], key: string | number, value: string | number): InstanceType<typeof Condition> {
    conditions.push(`${key} > ${value}`);
    return this;
  }

  private _ge(conditions: string[], key: string | number, value: string | number): InstanceType<typeof Condition> {
    conditions.push(`${key} >= ${value}`);
    return this;
  }

  private _beginsWith(
    conditions: string[],
    key: string | number,
    value: string | number,
  ): InstanceType<typeof Condition> {
    conditions.push(`begins_with(${key}, ${value})`);
    return this;
  }

  private _between(
    conditions: string[],
    key: string | number,
    value1: string | number,
    value2: string | number,
  ): InstanceType<typeof Condition> {
    conditions.push(`${key} BETWEEN ${value1} AND ${value2}`);
    return this;
  }
}
