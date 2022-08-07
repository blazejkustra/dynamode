import { RESERVED_WORDS } from '@aws/reservedWords';

import { valueToDynamo } from './converter';
import { DefaultError } from './Error';
import { AttributeMap } from './types';

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

export function substituteAttributeValue(attributeValues: AttributeMap, name: string, value: unknown): string {
  const key = name.split('.').join('_');

  for (let appendix = 0; appendix < 1000; appendix++) {
    const substituteKey = `:${key}${appendix || ''}`;
    if (!attributeValues[substituteKey]) {
      attributeValues[substituteKey] = valueToDynamo(value);
      return substituteKey;
    }
  }
  throw new DefaultError();
}

export function substituteAttribute(
  attributeNames: Record<string, string>,
  attributeValues: AttributeMap,
  key: string,
  value: unknown,
): { k: string; v: string } {
  return {
    k: substituteAttributeName(attributeNames, key),
    v: substituteAttributeValue(attributeValues, key, value),
  };
}
