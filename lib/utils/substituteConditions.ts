import { RESERVED_WORDS } from '@aws/reservedWords';
import { ConditionInstance } from '@lib/Condition';
import { Model } from '@lib/Model';
import { UpdateProps } from '@lib/Model/types';

import { valueToDynamo } from '../utils/converter';
import { DefaultError } from '../utils/Error';
import { AttributeMap } from '../utils/types';

import { isEmpty } from './helpers';
import { buildUpdateConditions } from './updateExpression';

export type ConditionExpression = {
  keys?: string[];
  values?: unknown[];
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

interface SubstituteModelUpdateConditions {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: AttributeMap;
  UpdateExpression?: string;
}

export function substituteModelUpdateConditions<M extends Model>(props: UpdateProps<M>): SubstituteModelUpdateConditions {
  const attributeNames: Record<string, string> = {};
  const attributeValues: AttributeMap = {};
  const conditions = buildUpdateConditions(props);
  const updateExpression = buildExpression(conditions, attributeNames, attributeValues);

  return {
    ...(!isEmpty(attributeNames) ? { ExpressionAttributeNames: attributeNames } : {}),
    ...(!isEmpty(attributeValues) ? { ExpressionAttributeValues: attributeValues } : {}),
    ...(updateExpression ? { UpdateExpression: updateExpression } : {}),
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
      const { keys, values } = condition;

      if (keys) {
        keys.forEach((key) => {
          const substituteKey = substituteAttributeName(attributeNames, key);
          expr = expr.replace('$K', substituteKey);
        });

        values?.forEach((value, idx) => {
          const substituteValueKey = substituteAttributeValues(attributeValues, keys[idx], value);
          expr = expr.replace('$V', substituteValueKey);
        });
      }

      return expr;
    })
    .join(' ');
}

const NESTED_ATTRIBUTE_REGEX = /\.(\d*)(\.|$)/;

export function replaceNestedAttributesRegex(key: string): string {
  return key.replace(NESTED_ATTRIBUTE_REGEX, '[$1]$2');
}

function substituteAttributeName(attributeNames: Record<string, string>, name: string): string {
  const keys = replaceNestedAttributesRegex(name).split('.');

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
    const substituteValueKey = `:${key}${appendix ? `__${appendix}` : ''}`;
    if (!attributeValues[substituteValueKey]) {
      attributeValues[substituteValueKey] = valueToDynamo(value);
      return substituteValueKey;
    }
  }
  throw new DefaultError();
}
