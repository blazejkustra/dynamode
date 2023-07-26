import Condition from '@lib/condition';
import Entity from '@lib/entity';
import { buildProjectionOperators, buildUpdateOperators } from '@lib/entity/helpers/buildOperators';
import {
  BuildDeleteConditionExpression,
  BuildGetProjectionExpression,
  BuildPutConditionExpression,
  BuildUpdateConditionExpression,
  EntityKey,
  UpdateProps,
} from '@lib/entity/types';
import { AttributeNames, ExpressionBuilder, isNotEmpty, isNotEmptyString } from '@lib/utils';

export function buildGetProjectionExpression<E extends typeof Entity>(
  attributes?: Array<EntityKey<E>>,
  attributeNames: AttributeNames = {},
): BuildGetProjectionExpression {
  if (!attributes || attributes.length === 0) {
    return {};
  }

  const operators = buildProjectionOperators(attributes);
  const projectionExpression = new ExpressionBuilder({ attributeNames }).run(operators);

  return {
    projectionExpression: isNotEmptyString(projectionExpression) ? projectionExpression : undefined,
    attributeNames: isNotEmpty(attributeNames) ? attributeNames : undefined,
  };
}

export function buildUpdateConditionExpression<E extends typeof Entity>(
  entity: E,
  props: UpdateProps<E>,
  optionsCondition?: Condition<E>,
): BuildUpdateConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const operators = buildUpdateOperators(entity, props);

  return {
    updateExpression: expressionsBuilder.run(operators),
    conditionExpression: optionsCondition ? expressionsBuilder.run(optionsCondition['operators']) : undefined,
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}

export function buildPutConditionExpression<E extends typeof Entity>(
  overwriteCondition?: Condition<E>,
  optionsCondition?: Condition<E>,
): BuildPutConditionExpression {
  const expressionsBuilder = new ExpressionBuilder();
  const conditions = overwriteCondition?.condition(optionsCondition) || optionsCondition?.condition(overwriteCondition);
  const conditionExpression = expressionsBuilder.run(conditions?.['operators'] || []);

  return {
    conditionExpression: isNotEmptyString(conditionExpression) ? conditionExpression : undefined,
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
  const conditionExpression = expressionsBuilder.run(conditions?.['operators'] || []);

  return {
    conditionExpression: isNotEmptyString(conditionExpression) ? conditionExpression : undefined,
    attributeNames: expressionsBuilder.attributeNames,
    attributeValues: expressionsBuilder.attributeValues,
  };
}
