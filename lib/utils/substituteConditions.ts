import { RESERVED_WORDS } from '@aws/reservedWords';
import { ConditionInstance } from '@lib/Condition';
import { Model } from '@lib/Model';

import { valueToDynamo } from '../utils/converter';
import { DefaultError } from '../utils/Error';
import { AttributeMap } from '../utils/types';

import { isEmpty } from './helpers';

export type ConditionExpression = {
  key?: string;
  values?: (string | number)[];
  expr: string;
};

interface SubstituteQueryConditions {
  attributeNames: Record<string, string>;
  attributeValues: AttributeMap;
  conditionExpression: string;
  keyConditionExpression: string;
}

export function substituteQueryConditions(filterConditions: ConditionExpression[], keyConditions: ConditionExpression[]): SubstituteQueryConditions {
  const attributeNames: Record<string, string> = {};
  const attributeValues: AttributeMap = {};

  return {
    attributeNames,
    attributeValues,
    conditionExpression: buildExpression(filterConditions, attributeNames, attributeValues),
    keyConditionExpression: buildExpression(keyConditions, attributeNames, attributeValues),
  };
}

interface SubstituteModelConditions {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  ConditionExpression?: string;
}

export function substituteModelPutConditions<M extends typeof Model>(overwriteCondition?: ConditionInstance<M>, optionsCondition?: ConditionInstance<M>): SubstituteModelConditions {
  const attributeNames: Record<string, string> = {};
  const attributeValues: AttributeMap = {};
  let conditionExpression: string | undefined = undefined;

  if (overwriteCondition && optionsCondition) {
    conditionExpression = buildExpression(overwriteCondition.condition(optionsCondition).conditions, attributeNames, attributeValues);
  } else if (overwriteCondition) {
    conditionExpression = buildExpression(overwriteCondition.conditions, attributeNames, attributeValues);
  } else if (optionsCondition) {
    conditionExpression = buildExpression(optionsCondition.conditions, attributeNames, attributeValues);
  }

  return {
    ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
    ...(!isEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
    ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
  };
}

export function substituteModelDeleteConditions<M extends typeof Model>(optionsCondition?: ConditionInstance<M>): SubstituteModelConditions {
  const attributeNames: Record<string, string> = {};
  const attributeValues: AttributeMap = {};
  const conditionExpression = buildExpression(optionsCondition?.conditions || [], attributeNames, attributeValues);

  return {
    ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
    ...(!isEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
    ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
  };
}

function buildExpression(conditions: ConditionExpression[], attributeNames: Record<string, string>, attributeValues: AttributeMap): string {
  return conditions
    .map((condition) => {
      let { expr } = condition;
      const { key, values } = condition;

      if (key) {
        const substituteKey = substituteAttributeName(attributeNames, key);
        expr = expr.replace('$K', substituteKey);

        if (values) {
          values.forEach((value) => {
            const substituteValueKey = substituteAttributeValues(attributeValues, key, value);
            expr = expr.replace('$V', substituteValueKey);
          });
        }
      }

      return expr;
    })
    .join(' ');
}

function substituteAttributeName(attributeNames: Record<string, string>, name: string): string {
  const keys = name.split('.');
  return keys
    .map((key) => {
      if (!RESERVED_WORDS.find((word) => word === key.toUpperCase())) {
        return key;
      }
      const substituteKey = `#${key}`;
      attributeNames[substituteKey] = key;
      return substituteKey;
    })
    .join('.');
}

function substituteAttributeValues(attributeValues: AttributeMap, name: string, value: unknown): string {
  const key = name.split('.').join('_');

  for (let appendix = 0; appendix < 1000; appendix++) {
    const substituteValueKey = `:${key}${appendix ? `_${appendix}` : ''}`;
    if (!attributeValues[substituteValueKey]) {
      attributeValues[substituteValueKey] = valueToDynamo(value);
      return substituteValueKey;
    }
  }
  throw new DefaultError();
}
