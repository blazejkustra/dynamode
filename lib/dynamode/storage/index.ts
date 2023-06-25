import { validateAttribute } from '@lib/dynamode/storage/helpers';
import type {
  AttributeMetadata,
  AttributesMetadata,
  EntitiesMetadata,
  EntityMetadata,
  TableMetadata,
  TablesMetadata,
} from '@lib/dynamode/storage/types';
import Entity from '@lib/entity';
import { Metadata } from '@lib/table/types';
import { DynamodeStorageError, mergeObjects } from '@lib/utils';

export default class DynamodeStorage {
  public tables: TablesMetadata = {};
  public entities: EntitiesMetadata = {};

  public registerTable(tableEntity: typeof Entity, metadata: Metadata<typeof Entity>): void {
    const tableMetadata: TableMetadata = {
      tableEntity,
      metadata,
    };

    if (this.tables[metadata.tableName]) {
      throw new DynamodeStorageError(`Table "${metadata.tableName}" already registered`);
    }

    this.tables[metadata.tableName] = tableMetadata;
  }

  public registerEntity(entity: typeof Entity, tableName: string): void {
    const existingEntityMetadata = this.entities[entity.name];
    const entityMetadata: EntityMetadata = {
      entity,
      tableName,
      attributes: existingEntityMetadata?.attributes || {},
    };

    if (!this.tables[tableName]) {
      throw new DynamodeStorageError(`Table "${tableName}" not registered`);
    }

    if (existingEntityMetadata?.entity || existingEntityMetadata?.tableName) {
      throw new DynamodeStorageError(`Entity "${entity.name}" already registered`);
    }

    this.entities[entity.name] = entityMetadata;
  }

  public registerAttribute(entityName: string, propertyName: string, value: AttributeMetadata): void {
    if (!this.entities[entityName]) {
      this.entities[entityName] = { attributes: {} } as EntityMetadata;
    }

    if (this.entities[entityName].attributes[propertyName]) {
      throw new DynamodeStorageError(`Attribute "${propertyName}" already registered in entity "${entityName}"`);
    }

    this.entities[entityName].attributes[propertyName] = value;
  }

  public updateAttributePrefix(entityName: string, propertyName: string, value: string): void {
    const attributeMetadata = this.entities[entityName].attributes[propertyName];
    attributeMetadata.prefix = value;
  }

  public updateAttributeSuffix(entityName: string, propertyName: string, value: string): void {
    const attributeMetadata = this.entities[entityName].attributes[propertyName];
    attributeMetadata.suffix = value;
  }

  public getEntityAttributes(entityName: string): AttributesMetadata {
    const entitiesAttributes: AttributesMetadata[] = [];
    let constructor = this.entities[entityName]?.entity;

    while (constructor) {
      if (!constructor.name || !this.entities[constructor.name]) {
        break;
      }

      const attributes = this.entities[constructor.name].attributes;
      entitiesAttributes.push(attributes);
      constructor = Object.getPrototypeOf(constructor);
    }

    return mergeObjects(...entitiesAttributes.reverse());
  }

  public getEntityTableName(entityName: string): string {
    if (!this.entities[entityName]) {
      throw new DynamodeStorageError(`Invalid entity name "${entityName}`);
    }

    return this.entities[entityName].tableName;
  }

  public getEntityMetadata(entityName: string): Metadata<typeof Entity> {
    if (!this.entities[entityName]) {
      throw new DynamodeStorageError(`Invalid entity name "${entityName}`);
    }

    const { tableName } = this.entities[entityName];

    if (!this.tables[tableName]) {
      throw new DynamodeStorageError(`Invalid table name "${tableName}`);
    }

    return this.tables[tableName].metadata;
  }

  public validateTableMetadata(entityName: string): void {
    const metadata = this.getEntityMetadata(entityName);
    const attributes = this.getEntityAttributes(entityName);

    validateAttribute({ name: metadata.partitionKey, attributes, role: 'partitionKey' });
    validateAttribute({ name: metadata.sortKey, attributes, role: 'sortKey' });
    Object.entries(metadata.indexes ?? {}).forEach(([indexName, index]) => {
      if (index.partitionKey) {
        // Validate GSI
        validateAttribute({ name: index.partitionKey, attributes, role: 'gsiPartitionKey', indexName });
        validateAttribute({ name: index.sortKey, attributes, role: 'gsiSortKey', indexName });
      } else {
        // Validate LSI
        validateAttribute({ name: index.sortKey, attributes, role: 'lsiSortKey', indexName });
      }
    });
  }
}
