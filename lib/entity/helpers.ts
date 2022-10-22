import { ReturnValue as DynamoReturnValue, ReturnValuesOnConditionCheckFailure as DynamoReturnValueOnFailure } from '@aws-sdk/client-dynamodb';
import Condition from '@lib/condition';
import { BuildDeleteConditionExpression, BuildGetProjectionExpression, BuildPutConditionExpression, BuildUpdateConditionExpression, Entity, EntityKey, ReturnValues, ReturnValuesLimited, UpdateProps } from '@lib/entity/types';
import { AttributeMap, buildExpression, checkDuplicatesInArray, ConditionExpression, DefaultError, isNotEmpty, isNotEmptyArray, isNotEmptyString, substituteAttributeName } from '@lib/utils';

export function buildProjectionExpression<T extends Entity<T>>(attributes: Array<EntityKey<T>>, attributeNames: Record<string, string>): string {
  if (checkDuplicatesInArray(attributes)) {
    throw new DefaultError();
  }

  return [...new Set([...attributes, 'dynamodeEntity'])].map((attribute) => substituteAttributeName(attributeNames, String(attribute))).join(', ');
}

export function buildGetProjectionExpression<T extends Entity<T>>(attributes?: Array<EntityKey<T>>): BuildGetProjectionExpression {
  if (!attributes) {
    return {};
  }

  const attributeNames: Record<string, string> = {};
  const projectionExpression = buildProjectionExpression(attributes, attributeNames);

  return {
    ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
    ProjectionExpression: projectionExpression,
  };
}

export function buildUpdateConditionExpression<T extends Entity<T>>(props: UpdateProps<T>, optionsCondition: Condition<T> | undefined): BuildUpdateConditionExpression {
  const attributeNames: Record<string, string> = {};
  const attributeValues: AttributeMap = {};
  const conditions = buildUpdateConditions(props);
  const updateExpression = buildExpression(conditions, attributeNames, attributeValues);
  const conditionExpression = optionsCondition ? buildExpression(optionsCondition.conditions, attributeNames, attributeValues) : undefined;

  return {
    ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
    ...(isNotEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
    ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
    UpdateExpression: updateExpression,
  };
}

export function buildUpdateConditions<T extends Entity<T>>(props: UpdateProps<T>): ConditionExpression[] {
  const conditions: ConditionExpression[] = [];

  if (
    (props.set && isNotEmpty(props.set)) ||
    (props.setIfNotExists && isNotEmpty(props.setIfNotExists)) ||
    (props.listAppend && isNotEmpty(props.listAppend)) ||
    (props.increment && isNotEmpty(props.increment)) ||
    (props.decrement && isNotEmpty(props.decrement))
  ) {
    const setKeys: string[] = [];
    const setValues: unknown[] = [];
    const setExprs: string[] = [];
    const setProps = [
      { ops: props.set, expr: '$K = $V', twoKeys: false },
      { ops: props.setIfNotExists, expr: '$K = if_not_exists($K, $V)', twoKeys: true },
      { ops: props.listAppend, expr: '$K = list_append($K, $V)', twoKeys: true },
      { ops: props.increment, expr: '$K = $K + $V', twoKeys: true },
      { ops: props.decrement, expr: '$K = $K - $V', twoKeys: true },
    ];

    setProps.forEach(({ ops, expr, twoKeys }) => {
      if (ops && isNotEmpty(ops)) {
        const keys = Object.keys(ops);
        const values = Object.values(ops);

        setKeys.push(...keys.flatMap((key) => Array(twoKeys ? 2 : 1).fill(key)));
        setValues.push(...values);
        setExprs.push(...Array(keys.length).fill(expr));
      }
    });

    conditions.push({ expr: 'SET' }, { keys: setKeys, values: setValues, expr: setExprs.join(', ') });
  }

  if (props.add && isNotEmpty(props.add)) {
    const keys = Object.keys(props.add);
    const values = Object.values(props.add);

    conditions.push(
      { expr: 'ADD' },
      {
        keys,
        values,
        expr: Array(keys.length).fill('$K $V').join(', '),
      },
    );
  }

  if (props.delete && isNotEmpty(props.delete)) {
    const keys = Object.keys(props.delete);
    const values = Object.values(props.delete);

    conditions.push(
      { expr: 'DELETE' },
      {
        keys,
        values,
        expr: Array(keys.length).fill('$K $V').join(', '),
      },
    );
  }

  if (isNotEmptyArray(props.remove)) {
    const keys = props.remove.map((key) => String(key));

    conditions.push(
      { expr: 'REMOVE' },
      {
        keys,
        expr: Array(keys.length).fill('$K').join(', '),
      },
    );
  }

  return conditions;
}

export function buildPutConditionExpression<T extends Entity<T>>(overwriteCondition?: Condition<T>, optionsCondition?: Condition<T>): BuildPutConditionExpression {
  const attributeNames: Record<string, string> = {};
  const attributeValues: AttributeMap = {};
  const conditions = overwriteCondition ? overwriteCondition.condition(optionsCondition).conditions : optionsCondition?.conditions || [];
  const conditionExpression = buildExpression(conditions, attributeNames, attributeValues);

  return {
    ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
    ...(isNotEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
    ...(isNotEmptyString(conditionExpression) ? { ConditionExpression: conditionExpression } : {}),
  };
}

export function buildDeleteConditionExpression<T extends Entity<T>>(notExistsCondition?: Condition<T>, optionsCondition?: Condition<T>): BuildDeleteConditionExpression {
  const attributeNames: Record<string, string> = {};
  const attributeValues: AttributeMap = {};
  const conditions = notExistsCondition ? notExistsCondition.condition(optionsCondition).conditions : optionsCondition?.conditions || [];
  const conditionExpression = buildExpression(conditions, attributeNames, attributeValues);

  return {
    ...(isNotEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
    ...(isNotEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
    ...(isNotEmptyString(conditionExpression) ? { ConditionExpression: conditionExpression } : {}),
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
