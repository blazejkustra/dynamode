import type { ValidateAttribute } from '@lib/dynamode/storage/types';
import { DYNAMODE_ALLOWED_KEY_TYPES, ValidationError } from '@lib/utils';

export function validateAttribute({ attributes, name, role, indexName }: ValidateAttribute): void {
  const attribute = attributes[name];
  if (!attribute) {
    throw new ValidationError(`Attribute "${name}" isn't registered in the entity.`);
  }

  if (attribute.role !== role) {
    throw new ValidationError(`Attribute "${name}" is registered with a wrong role.`);
  }

  if (attribute.indexName !== indexName) {
    throw new ValidationError(
      `Attribute "${name}" is registered with a wrong index name/shouldn't be registered with an index.`,
    );
  }

  if (!DYNAMODE_ALLOWED_KEY_TYPES.includes(attribute.type)) {
    throw new ValidationError(`Attribute "${name}" is registered with invalid type.`);
  }
}
