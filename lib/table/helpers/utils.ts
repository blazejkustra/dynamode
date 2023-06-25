import { AttributesMetadata } from '@lib/dynamode/storage/types';
import { ConflictError, deepEqual, DYNAMODE_DYNAMO_KEY_TYPE_MAP, ValidationError } from '@lib/utils';

export function compareDynamodeEntityWithDynamoTable<T>(aa: T[], bb: T[]): void {
  aa.forEach((a) => {
    if (!bb?.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in table`);
    }
  });

  bb.forEach((a) => {
    if (!aa.some((b) => deepEqual(a, b))) {
      throw new ConflictError(`Key "${JSON.stringify(a)}" not found in entity`);
    }
  });

  if (aa.length !== bb.length) {
    throw new ConflictError('Key schema length mismatch between table and entity');
  }
}

export function getAttributeType(attributes: AttributesMetadata, attribute: string): 'S' | 'N' {
  const attributeType = DYNAMODE_DYNAMO_KEY_TYPE_MAP.get(attributes[String(attribute)].type);

  if (!attributeType) {
    throw new ValidationError(`Attribute "${String(attribute)}" is registered with invalid type.`);
  }

  return attributeType;
}
