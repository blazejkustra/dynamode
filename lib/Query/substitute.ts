import { RESERVED_WORDS } from '@aws/reservedWords';

import { valueToDynamo } from '../utils/converter';
import { DefaultError } from '../utils/Error';
import { AttributeMap } from '../utils/types';

export type ConditionExpression = {
  key?: string;
  values?: (string | number)[];
  expr: string;
};

interface Substitute {
  attributeNames: Record<string, string>;
  attributeValues: AttributeMap;
  conditionExpression: string;
  keyConditionExpression: string;
}

export function substitute(conditions: ConditionExpression[], keyConditions: ConditionExpression[]): Substitute {
  const attributeNames: Record<string, string> = {};
  const attributeValues: AttributeMap = {};

  return {
    attributeNames,
    attributeValues,
    conditionExpression: buildExpression(conditions, attributeNames, attributeValues),
    keyConditionExpression: buildExpression(keyConditions, attributeNames, attributeValues),
  };
}

export function buildExpression(
  conditions: ConditionExpression[],
  attributeNames: Record<string, string>,
  attributeValues: AttributeMap,
): string {
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

export function substituteAttributeName(attributeNames: Record<string, string>, name: string): string {
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

export function substituteAttributeValues(attributeValues: AttributeMap, name: string, value: unknown): string {
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
