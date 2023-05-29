import { AttributeType } from '@lib/dynamode/storage/types';
import { DefaultError } from '@lib/utils';

export function getAttributeType(type: AttributeType) {
  switch (type) {
    case String:
      return 'S';
    case Number:
      return 'N';
    case Boolean:
      return 'B';
    case Object:
      return 'M';
    case Array:
      return 'L';
    case Set:
      return 'SS';
    case Map:
      return 'M';
    default:
      throw new DefaultError();
  }
}
