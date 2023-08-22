import { AttributesMetadata } from '@lib/dynamode/storage/types';
import { ConflictError, deepEqual, DYNAMODE_DYNAMO_KEY_TYPE_MAP, ValidationError } from '@lib/utils';

export function compareDynamodeEntityWithDynamoTable<T>(dynamodeSchema: T[], ddbSchema: T[]): void {
  dynamodeSchema.forEach((a) => {
    if (!ddbSchema?.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in table`);
    }
  });

  ddbSchema.forEach((a) => {
    if (!dynamodeSchema.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in entity`);
    }
  });
}

export function getAttributeType(attributes: AttributesMetadata, attribute: string): 'S' | 'N' {
  const attributeType = DYNAMODE_DYNAMO_KEY_TYPE_MAP.get(attributes[attribute].type);

  if (!attributeType) {
    throw new ValidationError(`Attribute "${attribute}" is decorated with invalid type.`);
  }

  return attributeType;
}
