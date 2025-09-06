import { AttributeType } from '@lib/condition/types';
import Entity from '@lib/entity';
import { transformValue } from '@lib/entity/helpers/transformValues';
import { EntityKey, EntityValue } from '@lib/entity/types';
import { BASE_OPERATOR, OPERATORS, Operators, ValidationError } from '@lib/utils';

/**
 * Condition builder for DynamoDB condition expressions.
 *
 * This class provides a fluent interface for building complex condition expressions
 * that can be used in DynamoDB operations like PutItem, UpdateItem, and DeleteItem.
 * It supports all DynamoDB condition operators and functions with type safety.
 *
 * @template E - The entity class type
 *
 * @example
 * ```typescript
 * // Basic conditions
 * const condition = new Condition(User)
 *   .attribute('status').eq('active')
 *   .attribute('age').gt(18);
 *
 * // Complex conditions with grouping
 * const condition = new Condition(User)
 *   .attribute('status').eq('active')
 *   .parenthesis(
 *     new Condition(User)
 *       .attribute('age').gt(18)
 *       .or
 *       .attribute('role').eq('admin')
 *   );
 *
 * // Using with entity manager
 * await UserManager.update(
 *   { id: 'user-123' },
 *   { status: 'inactive' },
 *   { condition }
 * );
 * ```
 *
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html} for DynamoDB condition expressions
 * @see {@link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html} for DynamoDB operators and functions
 */
export default class Condition<E extends typeof Entity> {
  /** The entity class for type-safe attribute access */
  protected entity: E;
  /** The current logical operator (AND or OR) for chaining conditions */
  protected logicalOperator: typeof BASE_OPERATOR.and | typeof BASE_OPERATOR.or = BASE_OPERATOR.and;
  /** Array of operators that make up the condition expression */
  protected operators: Operators;

  /**
   * Creates a new Condition instance for the specified entity.
   *
   * @param entity - The entity class to build conditions for
   *
   * @example
   * ```typescript
   * const condition = new Condition(User);
   * ```
   */
  constructor(entity: E) {
    this.entity = entity;
    this.operators = [];
  }

  /**
   * Starts building a condition for a specific attribute.
   *
   * This method returns an object with all available comparison operators
   * and functions for the specified attribute, providing a fluent interface
   * for building conditions.
   *
   * @template C - The condition instance type
   * @template K - The attribute key type
   * @param key - The attribute name to build a condition for
   * @returns An object with comparison operators and functions
   *
   * @example
   * ```typescript
   * const condition = new Condition(User)
   *   .attribute('status').eq('active')
   *   .attribute('age').gt(18)
   *   .attribute('email').beginsWith('admin@')
   *   .attribute('tags').contains('premium');
   * ```
   */
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
        if (values.length === 0) {
          // DynamoDB does not support an empty IN condition because it is logically impossible to have any value in an empty array. Therefore, an impossible condition is added to handle this case.
          this.operators.push(...OPERATORS.impossibleCondition(key));
          return this;
        }

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
          if (values.length === 0) {
            return this;
          }

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

  /**
   * Wraps a condition in parentheses for grouping.
   *
   * @param condition - Optional condition to wrap in parentheses
   * @returns The condition instance for chaining
   *
   * @example
   * ```typescript
   * const condition = new Condition(User)
   *   .attribute('status').eq('active')
   *   .and
   *   .parenthesis(
   *     new Condition(User)
   *       .attribute('age').gt(18)
   *       .or
   *       .attribute('role').eq('admin')
   *   );
   * ```
   */
  public parenthesis(condition?: Condition<E>): this {
    if (condition) {
      this.maybePushLogicalOperator();
      this.operators.push(...OPERATORS.parenthesis(condition.operators));
    }
    return this;
  }

  /**
   * Alias for parenthesis() method for grouping conditions.
   *
   * @param condition - Optional condition to wrap in parentheses
   * @returns The condition instance for chaining
   */
  public group(condition?: Condition<E>): this {
    return this.parenthesis(condition);
  }

  /**
   * Adds another condition to this condition.
   *
   * @param condition - The condition to add
   * @returns The condition instance for chaining
   *
   * @example
   * ```typescript
   * const baseCondition = new Condition(User)
   *   .attribute('status').eq('active');
   *
   * const finalCondition = baseCondition
   *   .condition(
   *     new Condition(User)
   *       .attribute('age').gt(18)
   *   );
   * ```
   */
  public condition(condition?: Condition<E>): this {
    if (condition) {
      this.maybePushLogicalOperator();
      this.operators.push(...condition.operators);
    }
    return this;
  }

  /**
   * Sets the logical operator to AND for the next condition.
   *
   * @returns The condition instance for chaining
   *
   * @example
   * ```typescript
   * const condition = new Condition(User)
   *   .attribute('status').eq('active')
   *   .attribute('age').gt(18);
   * ```
   */
  public get and(): this {
    this.logicalOperator = BASE_OPERATOR.and;
    return this;
  }

  /**
   * Sets the logical operator to OR for the next condition.
   *
   * @returns The condition instance for chaining
   *
   * @example
   * ```typescript
   * const condition = new Condition(User)
   *   .attribute('status').eq('active')
   *   .or
   *   .attribute('role').eq('admin');
   * ```
   */
  public get or(): this {
    this.logicalOperator = BASE_OPERATOR.or;
    return this;
  }

  /**
   * Adds an equality comparison operator.
   * @protected
   */
  protected eq<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.eq(key, transformValue(this.entity, key, value)));
    return this;
  }

  /**
   * Adds a not equal comparison operator.
   * @protected
   */
  protected ne<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.ne(key, transformValue(this.entity, key, value)));
    return this;
  }

  /**
   * Adds a less than comparison operator.
   * @protected
   */
  protected lt<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.lt(key, transformValue(this.entity, key, value)));
    return this;
  }

  /**
   * Adds a less than or equal comparison operator.
   * @protected
   */
  protected le<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.le(key, transformValue(this.entity, key, value)));
    return this;
  }

  /**
   * Adds a greater than comparison operator.
   * @protected
   */
  protected gt<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.gt(key, transformValue(this.entity, key, value)));
    return this;
  }

  /**
   * Adds a greater than or equal comparison operator.
   * @protected
   */
  protected ge<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.ge(key, transformValue(this.entity, key, value)));
    return this;
  }

  /**
   * Adds a begins_with function operator.
   * @protected
   */
  protected beginsWith<K extends EntityKey<E>>(operators: Operators, key: K, value: EntityValue<E, K>): this {
    operators.push(...OPERATORS.beginsWith(key, transformValue(this.entity, key, value)));
    return this;
  }

  /**
   * Adds a BETWEEN operator.
   * @protected
   */
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

  /**
   * Conditionally adds a logical operator between conditions.
   * @protected
   */
  protected maybePushLogicalOperator(): void {
    if (this.operators.length > 0) {
      this.operators.push(BASE_OPERATOR.space, this.logicalOperator, BASE_OPERATOR.space);
    }
    this.logicalOperator = BASE_OPERATOR.and;
  }
}

/**
 * DynamoDB attribute types enumeration.
 *
 * @see {@link AttributeType} for the full enumeration
 */
export { AttributeType };
