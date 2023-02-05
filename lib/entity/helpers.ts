import { ReturnValue as DynamoReturnValue, ReturnValuesOnConditionCheckFailure as DynamoReturnValueOnFailure } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { Dynamode } from '@lib/dynamode';
import type { BuildDeleteConditionExpression, BuildGetProjectionExpression, BuildPutConditionExpression, BuildUpdateConditionExpression, Entity, EntityKey, ReturnValues, ReturnValuesLimited, UpdateProps } from '@lib/entity/types';
import { AttributeNames, AttributeValues, BASE_OPERATOR, DefaultError, duplicatesInArray, insertBetween, isNotEmpty, isNotEmptyArray, Operators, valueFromDynamo } from '@lib/utils';

import { UPDATE_OPERATORS } from './../utils/constants';
import { ExpressionBuilder } from './../utils/ExpressionBuilder';

export function buildProjectionExpression<T extends Entity<T>>(attributes: Array<EntityKey<T>>, attributeNames: AttributeNames): string {
  if (duplicatesInArray(attributes)) {
    throw new DefaultError();
  }

  const uniqueAttributes = Array.from(new Set([...attributes, 'dynamodeEntity']));
  const operators: Operators = uniqueAttributes.map((attribute) => ({ key: String(attribute) }));
  return new ExpressionBuilder({ attributeNames }).run(insertBetween(operators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
}

export function buildGetProjectionExpression<T extends Entity<T>>(attributes?: Array<EntityKey<T>>): BuildGetProjectionExpression {
  if (!attributes) {
    return {};
  }

  const attributeNames: AttributeNames = {};

  return {
    projectionExpression: buildProjectionExpression(attributes, attributeNames),
    attributeNames: isNotEmpty(attributeNames) ? attributeNames : undefined,
  };
}

export function buildUpdateConditionExpression<T extends Entity<T>>(props: UpdateProps<T>, optionsCondition?: Condition<T>): BuildUpdateConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const operators = buildUpdateConditions(props);

  return {
    updateExpression: expressionsBuilder.run(operators),
    conditionExpression: optionsCondition ? expressionsBuilder.run(optionsCondition['operators']) : undefined,
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}

export function buildUpdateConditions<T extends Entity<T>>(props: UpdateProps<T>): Operators {
  const operators: Operators = [];

  if (isNotEmpty({ ...(props.set || {}), ...(props.setIfNotExists || {}), ...(props.listAppend || {}), ...(props.increment || {}), ...(props.decrement || {}) })) {
    const setOperators: Operators = [
      ...Object.entries(props.set || {}).flatMap(([key, value]) => UPDATE_OPERATORS.set(key, value)),
      ...Object.entries(props.setIfNotExists || {}).flatMap(([key, value]) => UPDATE_OPERATORS.setIfNotExists(key, value)),
      ...Object.entries(props.listAppend || {}).flatMap(([key, value]) => UPDATE_OPERATORS.listAppend(key, value)),
      ...Object.entries(props.increment || {}).flatMap(([key, value]) => UPDATE_OPERATORS.increment(key, value)),
      ...Object.entries(props.decrement || {}).flatMap(([key, value]) => UPDATE_OPERATORS.decrement(key, value)),
    ];

    operators.push(BASE_OPERATOR.set, BASE_OPERATOR.space, ...insertBetween(setOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
  }

  if (props.add && isNotEmpty(props.add)) {
    const addOperators: Operators = Object.entries(props.add).flatMap(([key, value]) => UPDATE_OPERATORS.add(key, value));
    if (operators.length) operators.push(BASE_OPERATOR.space);
    operators.push(BASE_OPERATOR.add, BASE_OPERATOR.space, ...insertBetween(addOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
  }

  if (props.delete && isNotEmpty(props.delete)) {
    const deleteOperators: Operators = Object.entries(props.delete).flatMap(([key, value]) => UPDATE_OPERATORS.delete(key, value));
    if (operators.length) operators.push(BASE_OPERATOR.space);
    operators.push(BASE_OPERATOR.delete, BASE_OPERATOR.space, ...insertBetween(deleteOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
  }

  if (isNotEmptyArray(props.remove)) {
    const removeOperators: Operators = props.remove.flatMap((key) => UPDATE_OPERATORS.remove(String(key)));
    if (operators.length) operators.push(BASE_OPERATOR.space);
    operators.push(BASE_OPERATOR.remove, BASE_OPERATOR.space, ...insertBetween(removeOperators, [BASE_OPERATOR.comma, BASE_OPERATOR.space]));
  }

  return operators;
}

export function buildPutConditionExpression<T extends Entity<T>>(overwriteCondition?: Condition<T>, optionsCondition?: Condition<T>): BuildPutConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const conditions = overwriteCondition?.condition(optionsCondition) || optionsCondition?.condition(overwriteCondition);

  return {
    conditionExpression: expressionsBuilder.run(conditions?.['operators'] || []),
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}

export function buildDeleteConditionExpression<T extends Entity<T>>(notExistsCondition?: Condition<T>, optionsCondition?: Condition<T>): BuildDeleteConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const conditions = notExistsCondition?.condition(optionsCondition) || optionsCondition?.condition(notExistsCondition);

  return {
    conditionExpression: expressionsBuilder.run(conditions?.['operators'] || []),
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}

export function mapReturnValues(returnValues?: ReturnValues): DynamoReturnValue {
  if (!returnValues) {
    return 'ALL_NEW';
  }

  return (
    {
      none: 'NONE',
      allOld: 'ALL_OLD',
      allNew: 'ALL_NEW',
      updatedOld: 'UPDATED_OLD',
      updatedNew: 'UPDATED_NEW',
    } as const
  )[returnValues];
}

export function mapReturnValuesLimited(returnValues?: ReturnValuesLimited): DynamoReturnValueOnFailure {
  if (!returnValues) {
    return 'ALL_OLD';
  }

  return (
    {
      none: 'NONE',
      allOld: 'ALL_OLD',
    } as const
  )[returnValues];
}

export function convertEntityToAttributeValues<T extends Entity<T>>(dynamoItem?: AttributeValues, tableName?: string): InstanceType<T> | undefined {
  if (!dynamoItem || !tableName) {
    return undefined;
  }

  const entityName = valueFromDynamo(dynamoItem.dynamodeEntity);

  if (typeof entityName !== 'string') {
    throw new DefaultError();
  }

  const { entityConstructor } = Dynamode.storage.getEntityMetadata(tableName, entityName);

  if (!entityConstructor) {
    throw new DefaultError();
  }

  return entityConstructor.convertAttributeValuesToEntity(dynamoItem);
}
