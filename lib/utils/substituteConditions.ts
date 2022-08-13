import { RESERVED_WORDS } from '@aws/reservedWords';

import { valueToDynamo } from './converter';
import { DefaultError } from './Error';
import { AttributeMap } from './types';

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

interface SubstituteModelDeleteConditions {
  attributeNames: Record<string, string>;
  attributeValues: AttributeMap;
  conditionExpression: string;
}

export function substituteModelDeleteConditions(conditions: ConditionExpression[]): SubstituteModelDeleteConditions {
  const attributeNames: Record<string, string> = {};
  const attributeValues: AttributeMap = {};

  return {
    attributeNames,
    attributeValues,
    conditionExpression: buildExpression(conditions, attributeNames, attributeValues),
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
