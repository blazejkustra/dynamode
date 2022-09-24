import { AttributeMap, DefaultError, NESTED_ATTRIBUTE_REGEX, RESERVED_WORDS, valueToDynamo } from '@lib/utils';

export type ConditionExpression = {
  keys?: string[];
  values?: unknown[];
  expr: string;
};

export function buildExpression(conditions: ConditionExpression[], attributeNames: Record<string, string>, attributeValues: AttributeMap): string {
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

function replaceNestedAttributesRegex(key: string): string {
  return key.replace(NESTED_ATTRIBUTE_REGEX, '[$1]$2');
}

export function substituteAttributeName(attributeNames: Record<string, string>, name: string): string {
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

export function substituteAttributeValues(attributeValues: AttributeMap, name: string, value: unknown): string {
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
