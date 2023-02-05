import type { AttributeType } from '@lib/condition/types';
import type { Entity, EntityKey, EntityValue } from '@lib/entity/types';
import { OPERATORS, Operators } from '@lib/utils';

import { BASE_OPERATOR } from './../utils/constants';

export default class Condition<T extends Entity<T>> {
  protected entity: T;
  protected logicalOperator: typeof BASE_OPERATOR.and | typeof BASE_OPERATOR.or = BASE_OPERATOR.and;
  protected operators: Operators;

  constructor(entity: T) {
    this.entity = entity;
    this.operators = [];
  }

  public attribute<C extends Condition<T>, K extends EntityKey<T>>(this: C, key: K) {
    this.maybePushLogicalOperator();

    return {
      eq: (value: EntityValue<T, K>): C => this.eq(this.operators, key, value),
      ne: (value: EntityValue<T, K>): C => this.ne(this.operators, key, value),
      lt: (value: EntityValue<T, K>): C => this.lt(this.operators, key, value),
      le: (value: EntityValue<T, K>): C => this.le(this.operators, key, value),
      gt: (value: EntityValue<T, K>): C => this.gt(this.operators, key, value),
      ge: (value: EntityValue<T, K>): C => this.ge(this.operators, key, value),
      beginsWith: (value: EntityValue<T, K>): C => this.beginsWith(this.operators, key, value),
      between: (value1: EntityValue<T, K>, value2: EntityValue<T, K>): C => this.between(this.operators, key, value1, value2),
      contains: (value: EntityValue<T, K>): C => {
        const processedValue = value;

        // TODO(blazejkustra): Make sure that this logic is valid for sets
        // if (value instanceof Set) {
        //   if (value.size > 1) {
        //     throw new DefaultError();
        //   }
        //   processedValue = Array.from(value)[0];
        // }

        this.operators.push(...OPERATORS.contains(String(key), this.entity.prefixSuffixValue(key, processedValue)));
        return this;
      },
      in: (values: Array<EntityValue<T, K>>): C => {
        const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
        this.operators.push(...OPERATORS.in(String(key), processedValues));
        return this;
      },
      type: (value: AttributeType): C => {
        this.operators.push(...OPERATORS.attributeType(String(key), value));
        return this;
      },
      exists: (): C => {
        this.operators.push(...OPERATORS.attributeExists(String(key)));
        return this;
      },
      size: () => ({
        eq: (value: number): C => {
          this.operators.push(...OPERATORS.sizeEq(String(key), value));
          return this;
        },
        ne: (value: number): C => {
          this.operators.push(...OPERATORS.sizeNe(String(key), value));
          return this;
        },
        lt: (value: number): C => {
          this.operators.push(...OPERATORS.sizeLt(String(key), value));
          return this;
        },
        le: (value: number): C => {
          this.operators.push(...OPERATORS.sizeLe(String(key), value));
          return this;
        },
        gt: (value: number): C => {
          this.operators.push(...OPERATORS.sizeGt(String(key), value));
          return this;
        },
        ge: (value: number): C => {
          this.operators.push(...OPERATORS.sizeGe(String(key), value));
          return this;
        },
      }),
      not: () => ({
        eq: (value: EntityValue<T, K>): C => this.ne(this.operators, key, value),
        ne: (value: EntityValue<T, K>): C => this.eq(this.operators, key, value),
        lt: (value: EntityValue<T, K>): C => this.ge(this.operators, key, value),
        le: (value: EntityValue<T, K>): C => this.gt(this.operators, key, value),
        gt: (value: EntityValue<T, K>): C => this.le(this.operators, key, value),
        ge: (value: EntityValue<T, K>): C => this.lt(this.operators, key, value),
        contains: (value: EntityValue<T, K>): C => {
          const processedValue = value;

          // TODO(blazejkustra): Make sure that this logic is valid for sets
          // if (value instanceof Set) {
          //   if (value.size > 1) {
          //     throw new DefaultError();
          //   }
          //   processedValue = Array.from(value)[0];
          // }

          this.operators.push(...OPERATORS.notContains(String(key), this.entity.prefixSuffixValue(key, processedValue)));

          return this;
        },
        in: (values: Array<EntityValue<T, K>>): C => {
          const processedValues = values.map((value) => this.entity.prefixSuffixValue(key, value));
          this.operators.push(...OPERATORS.notIn(String(key), processedValues));
          return this;
        },
        exists: (): C => {
          this.operators.push(...OPERATORS.attributeNotExists(String(key)));
          return this;
        },
      }),
    };
  }

  public parenthesis(condition?: Condition<T>): this {
    if (condition) {
      this.maybePushLogicalOperator();
      this.operators.push(...OPERATORS.parenthesis(condition.operators));
    }
    return this;
  }

  public group(condition?: Condition<T>): this {
    return this.parenthesis(condition);
  }

  public condition(condition?: Condition<T>): this {
    if (condition) {
      this.maybePushLogicalOperator();
      this.operators.push(...condition.operators);
    }
    return this;
  }

  public get and(): this {
    this.logicalOperator = BASE_OPERATOR.and;
    return this;
  }

  public get or(): this {
    this.logicalOperator = BASE_OPERATOR.or;
    return this;
  }

  protected eq<K extends EntityKey<T>>(operators: Operators, key: K, value: EntityValue<T, K>): this {
    operators.push(...OPERATORS.eq(String(key), this.entity.prefixSuffixValue(key, value)));
    return this;
  }

  protected ne<K extends EntityKey<T>>(operators: Operators, key: K, value: EntityValue<T, K>): this {
    operators.push(...OPERATORS.ne(String(key), this.entity.prefixSuffixValue(key, value)));
    return this;
  }

  protected lt<K extends EntityKey<T>>(operators: Operators, key: K, value: EntityValue<T, K>): this {
    operators.push(...OPERATORS.lt(String(key), this.entity.prefixSuffixValue(key, value)));
    return this;
  }

  protected le<K extends EntityKey<T>>(operators: Operators, key: K, value: EntityValue<T, K>): this {
    operators.push(...OPERATORS.le(String(key), this.entity.prefixSuffixValue(key, value)));
    return this;
  }

  protected gt<K extends EntityKey<T>>(operators: Operators, key: K, value: EntityValue<T, K>): this {
    operators.push(...OPERATORS.gt(String(key), this.entity.prefixSuffixValue(key, value)));
    return this;
  }

  protected ge<K extends EntityKey<T>>(operators: Operators, key: K, value: EntityValue<T, K>): this {
    operators.push(...OPERATORS.ge(String(key), this.entity.prefixSuffixValue(key, value)));
    return this;
  }

  protected beginsWith<K extends EntityKey<T>>(operators: Operators, key: K, value: EntityValue<T, K>): this {
    operators.push(...OPERATORS.beginsWith(String(key), this.entity.prefixSuffixValue(key, value)));
    return this;
  }

  protected between<K extends EntityKey<T>>(operators: Operators, key: K, v1: EntityValue<T, K>, v2: EntityValue<T, K>): this {
    operators.push(...OPERATORS.between(String(key), this.entity.prefixSuffixValue(key, v1), this.entity.prefixSuffixValue(key, v2)));
    return this;
  }

  protected maybePushLogicalOperator(): void {
    if (this.operators.length > 0) {
      this.operators.push(BASE_OPERATOR.space, this.logicalOperator, BASE_OPERATOR.space);
    }
    this.logicalOperator = BASE_OPERATOR.and;
  }
}

export { AttributeType };
