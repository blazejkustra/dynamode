import Condition from '@lib/condition';
import Entity from '@lib/entity';
import {
  BuildDeleteConditionExpression,
  BuildGetProjectionExpression,
  BuildPutConditionExpression,
  BuildUpdateConditionExpression,
  EntityKey,
  UpdateProps,
} from '@lib/entity/types';
import {
  AttributeNames,
  BASE_OPERATOR,
  DefaultError,
  duplicatesInArray,
  ExpressionBuilder,
  insertBetween,
  isNotEmpty,
  isNotEmptyArray,
  Operators,
  UPDATE_OPERATORS,
} from '@lib/utils';

export function buildProjectionExpression<E extends typeof Entity>(
  entity: E,
  attributes: Array<EntityKey<E>>,
  attributeNames: AttributeNames,
): string {
  if (duplicatesInArray(attributes)) {
    throw new DefaultError();
  }

  const uniqueAttributes = Array.from(new Set([...attributes, 'dynamodeEntity']));
  const operators: Operators = uniqueAttributes.map((attribute) => ({
    key: String(attribute),
  }));

  return new ExpressionBuilder({ attributeNames }).run(
    insertBetween(operators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]),
  );
}

export function buildGetProjectionExpression<E extends typeof Entity>(
  entity: E,
  attributes?: Array<EntityKey<E>>,
): BuildGetProjectionExpression {
  if (!attributes) {
    return {};
  }

  const attributeNames: AttributeNames = {};

  return {
    projectionExpression: buildProjectionExpression(entity, attributes, attributeNames),
    attributeNames: isNotEmpty(attributeNames) ? attributeNames : undefined,
  };
}

export function buildUpdateConditionExpression<E extends typeof Entity>(
  props: UpdateProps<E>,
  optionsCondition?: Condition<E>,
): BuildUpdateConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const operators = buildUpdateConditions(props);

  return {
    updateExpression: expressionsBuilder.run(operators),
    conditionExpression: optionsCondition ? expressionsBuilder.run(optionsCondition['operators']) : undefined,
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}

export function buildUpdateConditions<E extends typeof Entity>(props: UpdateProps<E>): Operators {
  const operators: Operators = [];

  if (
    isNotEmpty({
      ...(props.set || {}),
      ...(props.setIfNotExists || {}),
      ...(props.listAppend || {}),
      ...(props.increment || {}),
      ...(props.decrement || {}),
    })
  ) {
    const setOperators: Operators = [
      ...Object.entries(props.set || {}).flatMap(([key, value]) => UPDATE_OPERATORS.set(key, value)),
      ...Object.entries(props.setIfNotExists || {}).flatMap(([key, value]) =>
        UPDATE_OPERATORS.setIfNotExists(key, value),
      ),
      ...Object.entries(props.listAppend || {}).flatMap(([key, value]) => UPDATE_OPERATORS.listAppend(key, value)),
      ...Object.entries(props.increment || {}).flatMap(([key, value]) => UPDATE_OPERATORS.increment(key, value)),
      ...Object.entries(props.decrement || {}).flatMap(([key, value]) => UPDATE_OPERATORS.decrement(key, value)),
    ];

    operators.push(
      BASE_OPERATOR.set,
      BASE_OPERATOR.space,
      ...insertBetween(setOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]),
    );
  }

  if (props.add && isNotEmpty(props.add)) {
    const addOperators: Operators = Object.entries(props.add).flatMap(([key, value]) =>
      UPDATE_OPERATORS.add(key, value),
    );
    if (operators.length) operators.push(BASE_OPERATOR.space);
    operators.push(
      BASE_OPERATOR.add,
      BASE_OPERATOR.space,
      ...insertBetween(addOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]),
    );
  }

  if (props.delete && isNotEmpty(props.delete)) {
    const deleteOperators: Operators = Object.entries(props.delete).flatMap(([key, value]) =>
      UPDATE_OPERATORS.delete(key, value),
    );
    if (operators.length) operators.push(BASE_OPERATOR.space);
    operators.push(
      BASE_OPERATOR.delete,
      BASE_OPERATOR.space,
      ...insertBetween(deleteOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]),
    );
  }

  if (isNotEmptyArray(props.remove)) {
    const removeOperators: Operators = props.remove.flatMap((key) => UPDATE_OPERATORS.remove(String(key)));
    if (operators.length) operators.push(BASE_OPERATOR.space);
    operators.push(
      BASE_OPERATOR.remove,
      BASE_OPERATOR.space,
      ...insertBetween(removeOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]),
    );
  }

  return operators;
}

export function buildPutConditionExpression<E extends typeof Entity>(
  overwriteCondition?: Condition<E>,
  optionsCondition?: Condition<E>,
): BuildPutConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const conditions = overwriteCondition?.condition(optionsCondition) || optionsCondition?.condition(overwriteCondition);

  return {
    conditionExpression: expressionsBuilder.run(conditions?.['operators'] || []),
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}

export function buildDeleteConditionExpression<E extends typeof Entity>(
  notExistsCondition?: Condition<E>,
  optionsCondition?: Condition<E>,
): BuildDeleteConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const conditions = notExistsCondition?.condition(optionsCondition) || optionsCondition?.condition(notExistsCondition);

  return {
    conditionExpression: expressionsBuilder.run(conditions?.['operators'] || []),
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}
