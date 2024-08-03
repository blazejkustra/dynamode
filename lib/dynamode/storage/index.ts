import { Except } from 'type-fest';

import { validateDecoratedAttribute, validateMetadataAttribute } from '@lib/dynamode/storage/helpers/validator';
import type {
  AttributeIndexMetadata,
  AttributeMetadata,
  AttributesMetadata,
  EntitiesMetadata,
  EntityMetadata,
  TableMetadata,
  TablesMetadata,
} from '@lib/dynamode/storage/types';
import Entity from '@lib/entity';
import { Metadata } from '@lib/table/types';
import { DynamodeStorageError, mergeObjects, ValidationError } from '@lib/utils';

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

  public registerAttribute(
    entityName: string,
    propertyName: string,
    value: Except<AttributeMetadata, 'indexes'>,
  ): void {
    if (!this.entities[entityName]) {
      this.entities[entityName] = { attributes: {} } as EntityMetadata;
    }

    const attributeMetadata = this.entities[entityName].attributes[propertyName];

    // Throw error if attribute was already decorated and it's not an index
    if (attributeMetadata && attributeMetadata.role !== 'index') {
      throw new DynamodeStorageError(`Attribute "${propertyName}" was already decorated in entity "${entityName}"`);
    }

    // Otherwise, register attribute and copy over indexes
    this.entities[entityName].attributes[propertyName] = {
      ...value,
      indexes: attributeMetadata?.indexes,
    };
  }

  public registerIndex(entityName: string, propertyName: string, value: AttributeIndexMetadata): void {
    if (!this.entities[entityName]) {
      this.entities[entityName] = { attributes: {} } as EntityMetadata;
    }

    const attributeMetadata = this.entities[entityName].attributes[propertyName];

    // Merge indexes if attribute was already decorated
    if (attributeMetadata) {
      attributeMetadata.indexes = [...(attributeMetadata.indexes ?? []), ...value.indexes];
      return;
    }

    // Register attribute with indexes
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

  public getEntityClass(entityName: string): typeof Entity {
    const entityMetadata = this.entities[entityName];

    if (!entityMetadata) {
      throw new DynamodeStorageError(`Invalid entity name "${entityName}"`);
    }

    if (!entityMetadata.entity) {
      throw new DynamodeStorageError(
        `Entity "${entityName}" not registered, use TableManager.entityManager(${entityName}) first.`,
      );
    }

    return entityMetadata.entity;
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

  public renameEntity(oldName: string, newName: string): void {
    this.entities[newName] = { ...this.entities[newName], ...this.entities[oldName] };
    delete this.entities[oldName];
  }

  public validateTableMetadata(entityName: string): void {
    const metadata = this.getEntityMetadata(entityName);
    const attributes = this.getEntityAttributes(entityName);

    // Validate decorated attributes
    Object.entries(attributes).forEach(([name, attribute]) =>
      validateDecoratedAttribute({ name, attribute, metadata, entityName }),
    );

    // Validate table partition key
    validateMetadataAttribute({ name: metadata.partitionKey, attributes, validRoles: ['partitionKey'], entityName });

    // Validate table sort key
    if (metadata.sortKey) {
      validateMetadataAttribute({ name: metadata.sortKey, attributes, validRoles: ['sortKey'], entityName });
    }

    // Validate table timestamps
    if (metadata.createdAt) {
      validateMetadataAttribute({ name: metadata.createdAt, attributes, validRoles: ['date'], entityName });
    }
    if (metadata.updatedAt) {
      validateMetadataAttribute({ name: metadata.updatedAt, attributes, validRoles: ['date'], entityName });
    }

    // Validate table indexes
    Object.entries(metadata.indexes ?? {}).forEach(([indexName, index]) => {
      if (!index.partitionKey && !index.sortKey) {
        throw new ValidationError(
          `Index "${indexName}" should have a partition key or a sort key in "${entityName}" Entity.`,
        );
      }

      // Validate GSI
      if (index.partitionKey) {
        validateMetadataAttribute({
          name: index.partitionKey,
          attributes,
          indexName,
          entityName,
          validRoles: ['partitionKey', 'sortKey', 'index'],
        });

        if (index.sortKey) {
          validateMetadataAttribute({
            name: index.sortKey,
            attributes,
            indexName,
            entityName,
            validRoles: ['partitionKey', 'sortKey', 'index'],
          });
        }
      }

      // Validate LSI
      if (index.sortKey && !index.partitionKey) {
        validateMetadataAttribute({
          name: index.sortKey,
          attributes,
          indexName,
          entityName,
          validRoles: ['sortKey', 'index'],
        });
      }
    });
  }
}
