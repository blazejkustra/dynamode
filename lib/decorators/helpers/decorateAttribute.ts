import { IndexDecoratorOptions, PrefixSuffixOptions } from '@lib/decorators/types';
import Dynamode from '@lib/dynamode/index';
import { AttributeMetadata, AttributeRole, AttributeType } from '@lib/dynamode/storage/types';

export function decorateAttribute(
  type: AttributeType,
  role: AttributeRole,
  options?: PrefixSuffixOptions | IndexDecoratorOptions,
): (Entity: any, propertyName: string) => void {
  return (Entity: any, propertyName: string) => {
    const entityName = Entity.constructor.name;
    const prefix = options && 'prefix' in options ? options.prefix : undefined;
    const suffix = options && 'suffix' in options ? options.suffix : undefined;
    const indexName = options && 'indexName' in options ? options.indexName : undefined;
    const attributeMetadata: AttributeMetadata = {
      propertyName,
      type,
      role,
      indexName,
      prefix,
      suffix,
    };

    Dynamode.storage.registerAttribute(entityName, propertyName, attributeMetadata);
  };
}
