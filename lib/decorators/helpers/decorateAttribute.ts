import { IndexDecoratorOptions, PrefixSuffixOptions } from '@lib/decorators/types';
import Dynamode from '@lib/dynamode/index';
import { AttributeIndexRole, AttributeRole, AttributeType } from '@lib/dynamode/storage/types';

export function decorateAttribute(
  type: AttributeType,
  role: Exclude<AttributeRole, 'index'> | AttributeIndexRole,
  options?: PrefixSuffixOptions | IndexDecoratorOptions,
): (Entity: any, propertyName: string) => void {
  return (Entity: any, propertyName: string) => {
    const entityName = Entity.constructor.name;
    const prefix = options && 'prefix' in options ? options.prefix : undefined;
    const suffix = options && 'suffix' in options ? options.suffix : undefined;

    if (role === 'gsiPartitionKey' || role === 'gsiSortKey' || role === 'lsiSortKey') {
      const indexName = options && 'indexName' in options ? options.indexName : undefined;

      if (!indexName) {
        throw new Error(`Index name is required for ${role} attribute`);
      }

      return Dynamode.storage.registerAttribute(entityName, propertyName, {
        propertyName,
        type,
        role: 'index',
        indexes: [{ name: indexName, role }],
        prefix,
        suffix,
      });
    }

    Dynamode.storage.registerAttribute(entityName, propertyName, {
      propertyName,
      type,
      role,
      prefix,
      suffix,
    });
  };
}
