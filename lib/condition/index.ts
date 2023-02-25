import type { AttributeType } from '@lib/condition/types';
import Entity from '@lib/entity';
import { prefixSuffixValue } from '@lib/entity/helpers/prefixSuffix';
import { EntityKey, EntityValue } from '@lib/entity/types';
import { BASE_OPERATOR, OPERATORS, Operators } from '@lib/utils';

export default class Condition<E extends typeof Entity> {
  protected entity: E;
  protected logicalOperator: typeof BASE_OPERATOR.and | typeof BASE_OPERATOR.or = BASE_OPERATOR.and;
  protected operators: Operators;

  constructor(entity: E) {
    this.entity = entity;
    this.operators = [];
  }

  public attribute<C extends this, K extends EntityKey<E>>(this: C, key: K) {
    this.maybePushLogicalOperator();

    return {
      eq: (value: EntityValue<E, K>): C => this.eq(this.operators, key, value),
      ne: (value: EntityValue<E, K>): C => this.ne(this.operators, key, value),
      lt: (value: EntityValue<E, K>): C => this.lt(this.operators, key, value),
      le: (value: EntityValue<E, K>): C => this.le(this.operators, key, value),
      gt: (value: EntityValue<E, K>): C => this.gt(this.operators, key, value),
      ge: (value: EntityValue<E, K>): C => this.ge(this.operators, key, value),
      beginsWith: (value: EntityValue<E, K>): C => this.beginsWith(this.operators, key, value),
      between: (value1: EntityValue<E, K>, value2: EntityValue<E, K>): C =>
        this.between(this.operators, key, value1, value2),
      contains: (value: EntityValue<E, K>): C => {
        const processedValue = value;

        // TODO(blazejkustra): Make sure that this logic is valid for sets
        // if (value instanceof Set) {
        //   if (value.size > 1) {
        //     throw new DefaultError();
        //   }
        //   processedValue = Array.from(value)[0];
        // }

        this.operators.push(
          ...OPERATORS.contains(String(key), prefixSuffixValue(this.entity, key as EntityKey<E>, processedValue)),
        );
        return this;
      },
      in: (values: Array<EntityValue<E, K>>): C => {
        const processedValues = values.map((value) => prefixSuffixValue(this.entity, key as EntityKey<E>, value));
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
        eq: (value: EntityValue<E, K>): C => this.ne(this.operators, key, value),
        ne: (value: EntityValue<E, K>): C => this.eq(this.operators, key, value),
        lt: (value: EntityValue<E, K>): C => this.ge(this.operators, key, value),
        le: (value: EntityValue<E, K>): C => this.gt(this.operators, key, value),
        gt: (value: EntityValue<E, K>): C => this.le(this.operators, key, value),
        ge: (value: EntityValue<E, K>): C => this.lt(this.operators, key, value),
        contains: (value: EntityValue<E, K>): C => {
          const processedValue = value;

          // TODO(blazejkustra): Make sure that this logic is valid for sets
          // if (value instanceof Set) {
          //   if (value.size > 1) {
          //     throw new DefaultError();
          //   }
          //   processedValue = Array.from(value)[0];
          // }

          this.operators.push(
            ...OPERATORS.notContains(String(key), prefixSuffixValue(this.entity, key as EntityKey<E>, processedValue)),
          );

          return this;
        },
        in: (values: Array<EntityValue<E, K>>): C => {
          const processedValues = values.map((value) => prefixSuffixValue(this.entity, key as EntityKey<E>, value));
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

  public parenthesis(condition?: Condition<E>): this {
    if (condition) {
      this.maybePushLogicalOperator();
      this.operators.push(...OPERATORS.parenthesis(condition.operators));
    }
    return this;
  }

  public group(condition?: Condition<E>): this {
    return this.parenthesis(condition);
  }

  public condition(condition?: Condition<E>): this {
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

  protected eq<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.eq(String(key), prefixSuffixValue(this.entity, key as EntityKey<E>, value)));
    return this;
  }

  protected ne<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.ne(String(key), prefixSuffixValue(this.entity, key as EntityKey<E>, value)));
    return this;
  }

  protected lt<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.lt(String(key), prefixSuffixValue(this.entity, key as EntityKey<E>, value)));
    return this;
  }

  protected le<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.le(String(key), prefixSuffixValue(this.entity, key as EntityKey<E>, value)));
    return this;
  }

  protected gt<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.gt(String(key), prefixSuffixValue(this.entity, key as EntityKey<E>, value)));
    return this;
  }

  protected ge<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.ge(String(key), prefixSuffixValue(this.entity, key as EntityKey<E>, value)));
    return this;
  }

  protected beginsWith<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.beginsWith(String(key), prefixSuffixValue(this.entity, key as EntityKey<E>, value)));
    return this;
  }

  protected between<K extends EntityKey<E>>(
    operators: Operators,
    key: K,
    v1: EntityValue<E, K>,
    v2: EntityValue<E, K>,
  ): this {
    operators.push(
      ...OPERATORS.between(
        String(key),
        prefixSuffixValue(this.entity, key as EntityKey<E>, v1),
        prefixSuffixValue(this.entity, key as EntityKey<E>, v2),
      ),
    );
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
