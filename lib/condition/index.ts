import { AttributeType } from '@lib/condition/types';
import Entity from '@lib/entity';
import { transformValue } from '@lib/entity/helpers/transformValues';
import { EntityKey, EntityValue } from '@lib/entity/types';
import { BASE_OPERATOR, OPERATORS, Operators, ValidationError } from '@lib/utils';

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
        let processedValue: unknown = value;

        if (processedValue instanceof Set) {
          if (processedValue.size !== 1) {
            throw new ValidationError('contains() supports only one value in the set');
          }
          processedValue = Array.from(processedValue)[0];
        }

        if (Array.isArray(processedValue)) {
          if (processedValue.length !== 1) {
            throw new ValidationError('contains() supports only one value in the array');
          }
          processedValue = processedValue[0];
        }

        this.operators.push(...OPERATORS.contains(key, transformValue(this.entity, key, processedValue)));
        return this;
      },
      in: (values: Array<EntityValue<E, K>>): C => {
        const processedValues = values.map((value) => transformValue(this.entity, key, value));
        this.operators.push(...OPERATORS.in(key, processedValues));
        return this;
      },
      type: (value: AttributeType): C => {
        this.operators.push(...OPERATORS.attributeType(key, value));
        return this;
      },
      exists: (): C => {
        this.operators.push(...OPERATORS.attributeExists(key));
        return this;
      },
      size: () => ({
        eq: (value: number): C => {
          this.operators.push(...OPERATORS.sizeEq(key, value));
          return this;
        },
        ne: (value: number): C => {
          this.operators.push(...OPERATORS.sizeNe(key, value));
          return this;
        },
        lt: (value: number): C => {
          this.operators.push(...OPERATORS.sizeLt(key, value));
          return this;
        },
        le: (value: number): C => {
          this.operators.push(...OPERATORS.sizeLe(key, value));
          return this;
        },
        gt: (value: number): C => {
          this.operators.push(...OPERATORS.sizeGt(key, value));
          return this;
        },
        ge: (value: number): C => {
          this.operators.push(...OPERATORS.sizeGe(key, value));
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
          let processedValue: unknown = value;

          if (processedValue instanceof Set) {
            if (processedValue.size !== 1) {
              throw new ValidationError('contains() supports only one value in the set');
            }
            processedValue = Array.from(processedValue)[0];
          }

          if (Array.isArray(processedValue)) {
            if (processedValue.length !== 1) {
              throw new ValidationError('contains() supports only one value in the array');
            }
            processedValue = processedValue[0];
          }

          this.operators.push(...OPERATORS.notContains(key, transformValue(this.entity, key, processedValue)));

          return this;
        },
        in: (values: Array<EntityValue<E, K>>): C => {
          const processedValues = values.map((value) => transformValue(this.entity, key, value));
          this.operators.push(...OPERATORS.notIn(key, processedValues));
          return this;
        },
        exists: (): C => {
          this.operators.push(...OPERATORS.attributeNotExists(key));
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
    operators.push(...OPERATORS.eq(key, transformValue(this.entity, key, value)));
    return this;
  }

  protected ne<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.ne(key, transformValue(this.entity, key, value)));
    return this;
  }

  protected lt<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.lt(key, transformValue(this.entity, key, value)));
    return this;
  }

  protected le<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.le(key, transformValue(this.entity, key, value)));
    return this;
  }

  protected gt<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.gt(key, transformValue(this.entity, key, value)));
    return this;
  }

  protected ge<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.ge(key, transformValue(this.entity, key, value)));
    return this;
  }

  protected beginsWith<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.beginsWith(key, transformValue(this.entity, key, value)));
    return this;
  }

  protected between<K extends EntityKey<E>>(
    operators: Operators,
    key: K,
    v1: EntityValue<E, K>,
    v2: EntityValue<E, K>,
  ): this {
    operators.push(
      ...OPERATORS.between(key, transformValue(this.entity, key, v1), transformValue(this.entity, key, v2)),
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
